"""
# (C) Copyright 2016 SLU Global Bioinformatics Centre, SLU
# (http://sgbc.slu.se) and the B3Africa Project (http://www.b3africa.org/).
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the GNU Lesser General Public License
# (LGPL) version 3 which accompanies this distribution, and is available at
# http://www.gnu.org/licenses/lgpl.html
#
# This library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# Lesser General Public License for more details.
#
# Contributors:
#     Rafael Hernandez de Diego <rafahdediego@gmail.com>
#     Tomas Klingstrom
#     Erik Bongcam-Rudloff
#     and others.
#
"""

import logging
import re
from os import remove as removeFile

import requests
from bioblend.galaxy import GalaxyInstance
from flask import (
    Flask,
    json,
    jsonify,
    request,
    Response as flask_response,
    send_from_directory,
)

from .servlets import AdminFunctions
from .servlets import GalaxyAPI

HTML_REGEX = re.compile(r'((?:src|action|href)=["\'])/')
JQUERY_REGEX = re.compile(r'(\$\.(?:get|post)\(["\'])/')
JS_LOCATION_REGEX = re.compile(r'((?:window|document)\.location.*=.*["\'])/')
CSS_REGEX = re.compile(r'(url\(["\']?)/')

REGEXES = [HTML_REGEX, JQUERY_REGEX, JS_LOCATION_REGEX, CSS_REGEX]


class Application(object):
    # ******************************************************************************************************************
    # CONSTRUCTORS
    # ******************************************************************************************************************
    def __init__(self):
        # *******************************************************************************************
        # SERVLET DEFINITION
        # *******************************************************************************************
        self.app = Flask(__name__)
        self.isFirstLaunch = False
        self.isDocker = False
        self.settings = AdminFunctions.readConfigurationFile()
        self.app.config['MAX_CONTENT_LENGTH'] = self.settings.MAX_CONTENT_LENGTH * pow(1024, 2)

        self.log("Starting application...")

        # ******************************************************************************************
        #     ______ _____ _      ______  _____
        #   |  ____|_   _| |    |  ____|/ ____|
        #   | |__    | | | |    | |__  | (___
        #   |  __|   | | | |    |  __|  \___ \
        #   | |     _| |_| |____| |____ ____) |
        #   |_|    |_____|______|______|_____/
        #
        #  COMMON STEPS HANDLERS
        # *******************************************************************************************
        @self.app.route(self.settings.SERVER_SUBDOMAIN + '/')
        def main():
            if self.isFirstLaunch:
                self.log("First launch detected, showing install form")
                return send_from_directory(self.settings.ROOT_DIRECTORY + 'client/src/', 'install.html')
            else:
                return send_from_directory(self.settings.ROOT_DIRECTORY + 'client/src/', 'index.html')
        # *******************************************************************************************
        #  GET FILE
        # *******************************************************************************************
        @self.app.route(self.settings.SERVER_SUBDOMAIN + '/<path:filename>')
        def get_static(filename):
            return send_from_directory(self.settings.ROOT_DIRECTORY + 'client/src/', filename)

        @self.app.route(self.settings.SERVER_SUBDOMAIN + '/tmp/<path:filename>')
        def get_tmp_static(filename):
            return send_from_directory(self.settings.TMP_DIRECTORY, filename)

        # ******************************************************************************************
        #     _____          _               __   ____     __           _____ _____
        #    / ____|   /\   | |        /\    \ \ / /\ \   / /     /\   |  __ \_   _|
        #   | |  __   /  \  | |       /  \    \ V /  \ \_/ /     /  \  | |__) || |
        #   | | |_ | / /\ \ | |      / /\ \    > <    \   /     / /\ \ |  ___/ | |
        #   | |__| |/ ____ \| |____ / ____ \  / . \    | |     / ____ \| |    _| |_
        #    \_____/_/    \_\______/_/    \_\/_/ \_\   |_|    /_/    \_\_|   |_____|
        #
        # ******************************************************************************************
        @self.app.route(self.settings.SERVER_SUBDOMAIN + '/api/<path:service>', methods=['OPTIONS', 'POST', 'GET', 'DELETE', 'PUT'])
        def forward_request(service, method=None):
            # STEP 1. Read requests auth params
            auth = None
            if request.authorization is not None and len(request.authorization) > 0:
                auth = ()
                for i in request.authorization:
                    auth = auth + (request.authorization[i],)

            if method is None:
                method = request.method

            if service == "upload/":
                if self.settings.SAFE_UPLOAD:
                    self.log("New upload request detected")
                    service = "/api/tools"

                    data = dict(request.form)

                    tmp_files = AdminFunctions.storeTmpFiles(request.files, self.settings.TMP_DIRECTORY)
                    self.log("All files were temporary stored at: " + ", ".join(tmp_files))

                    self.log("Forwarding the files uploading...")

                    history_id = data.get("history_id")[0]
                    galaxy_key = data.get("key")[0]

                    gi = GalaxyInstance(self.settings.GALAXY_SERVER, galaxy_key)

                    responses = []
                    for tmp_file in tmp_files:
                        responses.append(gi.tools.upload_file(tmp_file, history_id))

                    for tmp_file in tmp_files:
                        removeFile(tmp_file)

                    return jsonify({'success': True, 'responses': responses})
                else:
                    service = "/api/tools"

                    data = dict(request.form)
                    # STEP 2. Generate the new requests
                    resp = requests.request(
                        method=method,
                        url=self.settings.GALAXY_SERVER + service,
                        data=data,
                        files=request.files,
                        auth=auth,
                        cookies=request.cookies,
                        allow_redirects=False)

            elif service == "signup/":
                self.log("New sign up request detected")

                service = "/user/create?cntrller=user"

                data = dict(request.form)
                # STEP 2. Generate the new requests
                resp = requests.request(
                    method=method,
                    url=self.settings.GALAXY_SERVER + service,
                    params=dict(request.args),
                    headers={'content-type': 'application/x-www-form-urlencoded'},
                    data=data,
                    auth=auth,
                    cookies=request.cookies,
                    allow_redirects=False)
            else:
                service = "/api/" + service

                self.log("New request detected (" + service + ")")

                # STEP 2. Generate the new requests
                resp = requests.request(
                    method=method,
                    url=self.settings.GALAXY_SERVER + service,
                    params=dict(request.args),
                    data=request.get_data(),
                    auth=auth,
                    cookies=request.cookies,
                    allow_redirects=False)

            headers = []
            excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
            headers = [(name, value) for (name, value) in list(resp.raw.headers.items()) if name.lower() not in excluded_headers]

            self.log("Done! Returning response...")

            response = flask_response(resp.content, resp.status_code, headers)
            return response

        @self.app.route(self.settings.SERVER_SUBDOMAIN + '/other/<path:service>', methods=['OPTIONS', 'POST', 'GET', 'DELETE', 'PUT'])
        def other_request(service, method=None):
            # STEP 1. Read requests auth params
            if service == 'workflows/report/':
                file_path = GalaxyAPI.generateWorkflowReport(request, self.settings)
                return jsonify({'success': True, 'path': file_path})
            return ""
        # ******************************************************************************************
        #             _____  __  __ _____ _   _
        #       /\   |  __ \|  \/  |_   _| \ | |
        #      /  \  | |  | | \  / | | | |  \| |
        #     / /\ \ | |  | | |\/| | | | | . ` |
        #    / ____ \| |__| | |  | |_| |_| |\  |
        #   /_/    \_\_____/|_|  |_|_____|_| \_|
        #
        # ******************************************************************************************
        @self.app.route(self.settings.SERVER_SUBDOMAIN + '/admin/local-galaxy-url', methods=['OPTIONS', 'GET'])
        def get_local_galaxy_url():
            if self.settings.GALAXY_SERVER_URL == "":
                return Response().setContent({"GALAXY_SERVER_URL": self.settings.GALAXY_SERVER, "MAX_CONTENT_LENGTH": self.settings.MAX_CONTENT_LENGTH}).getResponse()
            else:
                return Response().setContent({"GALAXY_SERVER_URL": self.settings.GALAXY_SERVER_URL}).getResponse()

        @self.app.route(self.settings.SERVER_SUBDOMAIN + '/admin/is-admin', methods=['OPTIONS', 'GET'])
        def is_admin():
            # 1. First check if the session is valid
            response = forward_request("users/current", "GET")
            if response.status_code == 200:
                account_email = json.loads(response.data).get("email")
                if account_email == request.cookies.get("galaxyuser"):
                    return AdminFunctions.isAdminAccount(request, Response(), self.settings.ROOT_DIRECTORY).getResponse()
            return Response().setContent({"success": False}).getResponse()

        @self.app.route(self.settings.SERVER_SUBDOMAIN + '/admin/list-settings', methods=['OPTIONS', 'GET'])
        def list_settings():
            # FIRST CHECK IF THE SESSION IS VALID AND IS AN ADMIN ACCOUNT
            if not self.isFirstLaunch:
                isAdmin = is_admin()
                isAdmin = json.loads(isAdmin[0].data).get("success")
            else:
                isAdmin = True
            if isAdmin:
                return AdminFunctions.getSettingsList(request, Response(), self.settings.ROOT_DIRECTORY, self.isFirstLaunch, self.isDocker).getResponse()
            return Response().setContent({"success": False}).setStatus(401).getResponse()

        @self.app.route(self.settings.SERVER_SUBDOMAIN + '/admin/update-settings', methods=['OPTIONS', 'POST'])
        def update_settings():
            # FIRST CHECK IF THE SESSION IS VALID AND IS AN ADMIN ACCOUNT
            if not self.isFirstLaunch:
                isAdmin = is_admin()
                isAdmin = json.loads(isAdmin[0].data).get("success")
            else:
                isAdmin = True

            if isAdmin:
                response = AdminFunctions.updateSettings(request, Response(), self.settings.ROOT_DIRECTORY, self.isFirstLaunch).getResponse()
                # Read again settings
                self.isFirstLaunch = False
                self.settings = AdminFunctions.readConfigurationFile()
                self.app.config['MAX_CONTENT_LENGTH'] = self.settings.MAX_CONTENT_LENGTH * pow(1024, 2)
                return response
            return Response().setContent({"success": False}).setStatus(401).getResponse()

        @self.app.route(self.settings.SERVER_SUBDOMAIN + '/admin/send-error-report', methods=['OPTIONS', 'POST'])
        def send_error_report():
            return AdminFunctions.sendErrorReport(request, Response()).getResponse()

    def iterform(self, multidict):
        for key in list(multidict.keys()):
            for value in multidict.getlist(key):
                yield (key.encode("utf8"), value.encode("utf8"))

    def launch(self):
        # *******************************************************************************************
        # LAUNCH APPLICATION
        # *******************************************************************************************
        self.app.run(host=self.settings.SERVER_HOST_NAME, port=self.settings.SERVER_PORT_NUMBER, debug=False, threaded=True)

    def log(self, message, type="info"):
        if self.settings.SERVER_ALLOW_DEBUG is True:
            if type == "warn":
                logging.warning(message)
            elif type == "err":
                logging.error(message)
            else:
                logging.info(message)


class Response(object):
    """This class is used to specify the custom response object"""

    # ****************************************************************
    # CONSTRUCTORS
    # ****************************************************************
    def __init__(self):
        self.content = ""
        self.status = 200
        # TODO: ENABLE THIS CODE??
        self.JSON_CONTENT_TYPE = {'Content-Type': 'application/json; charset=utf-8'}
        self.content_type = self.JSON_CONTENT_TYPE

    # ****************************************************************
    # GETTERS AND SETTER
    # ****************************************************************
    def setContent(self, content):
        self.content = content
        return self

    def getContent(self):
        return self.content

    def setStatus(self, status):
        self.status = status
        return self

    def getStatus(self):
        return self.status

    def setContentType(self, content_type):
        self.content_type = content_type
        return self

    def getContentType(self):
        return self.content_type

    def getResponse(self):
        return (jsonify(self.content), self.status, self.content_type)
