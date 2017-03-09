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
import logging.config
import requests
import re

import servlets.AdminFunctions as AdminFunctions
from flask import Flask, request, send_from_directory, request, jsonify, json
from flask import Response as flask_response

HTML_REGEX = re.compile(r'((?:src|action|href)=["\'])/')
JQUERY_REGEX = re.compile(r'(\$\.(?:get|post)\(["\'])/')
JS_LOCATION_REGEX = re.compile(r'((?:window|document)\.location.*=.*["\'])/')
CSS_REGEX = re.compile(r'(url\(["\']?)/')

REGEXES = [HTML_REGEX, JQUERY_REGEX, JS_LOCATION_REGEX, CSS_REGEX]

from conf.serverconf import *

class Application(object):
    #******************************************************************************************************************
    # CONSTRUCTORS
    #******************************************************************************************************************
    def __init__(self):
        #*******************************************************************************************
        #* SERVLET DEFINITION
        #*******************************************************************************************
        self.app = Flask(__name__)
        self.isFirstLaunch = False
        self.readConfigurationFile()

        #******************************************************************************************
        #     ______ _____ _      ______  _____
        #   |  ____|_   _| |    |  ____|/ ____|
        #   | |__    | | | |    | |__  | (___
        #   |  __|   | | | |    |  __|  \___ \
        #   | |     _| |_| |____| |____ ____) |
        #   |_|    |_____|______|______|_____/
        #
        #  COMMON STEPS HANDLERS
        #*******************************************************************************************
        @self.app.route(SERVER_SUBDOMAIN + '/')
        def main():
            if self.isFirstLaunch:
                return send_from_directory(self.ROOT_DIRECTORY + 'client/src/', 'install.html')
            else:
                return send_from_directory(self.ROOT_DIRECTORY + 'client/src/', 'index.html')
        ##*******************************************************************************************
        ##* GET FILE
        ##*******************************************************************************************
        @self.app.route(SERVER_SUBDOMAIN + '/<path:filename>')
        def get_static(filename):
            return send_from_directory(self.ROOT_DIRECTORY + 'client/src/', filename)

        #******************************************************************************************
        #     _____          _               __   ____     __           _____ _____
        #    / ____|   /\   | |        /\    \ \ / /\ \   / /     /\   |  __ \_   _|
        #   | |  __   /  \  | |       /  \    \ V /  \ \_/ /     /  \  | |__) || |
        #   | | |_ | / /\ \ | |      / /\ \    > <    \   /     / /\ \ |  ___/ | |
        #   | |__| |/ ____ \| |____ / ____ \  / . \    | |     / ____ \| |    _| |_
        #    \_____/_/    \_\______/_/    \_\/_/ \_\   |_|    /_/    \_\_|   |_____|
        #
        #******************************************************************************************
        @self.app.route(SERVER_SUBDOMAIN + '/api/<path:service>', methods=['OPTIONS', 'POST', 'GET', 'DELETE'])
        def forward_request(service, method = None):
            # STEP 1. Read requests auth params
            auth = None
            if request.authorization is not None and len(request.authorization) > 0:
                auth = ()
                for i in request.authorization:
                    auth = auth + (request.authorization[i],)

            if method == None:
                method = request.method

            if service == "upload/":
                service = "/api/tools"

                data = dict(request.form)
                # STEP 2. Generate the new requests
                resp = requests.request(
                    method=method,
                    url=GALAXY_SERVER + service,
                    data=data,
                    files=request.files,
                    auth=auth,
                    cookies=request.cookies,
                    allow_redirects=False)
            elif service == "signup/":
                service = "user/create?cntrller=user"

                data = dict(request.form)
                # STEP 2. Generate the new requests
                resp = requests.request(
                    method=method,
                    url=GALAXY_SERVER + service,
                    params= dict(request.args),
                    headers={u'content-type': u'application/x-www-form-urlencoded'},
                    data=data,
                    auth=auth,
                    cookies=request.cookies,
                    allow_redirects=False)
            else:
                service = "/api/" + service

                # STEP 2. Generate the new requests
                resp = requests.request(
                    method= method,
                    url= GALAXY_SERVER + service,
                    params= dict(request.args),
                    data=request.get_data(),
                    auth=auth,
                    cookies=request.cookies,
                    allow_redirects=False)

            headers = []
            excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
            headers = [(name, value) for (name, value) in resp.raw.headers.items() if name.lower() not in excluded_headers]

            response = flask_response(resp.content, resp.status_code, headers)
            return response

        #******************************************************************************************
        #             _____  __  __ _____ _   _
        #       /\   |  __ \|  \/  |_   _| \ | |
        #      /  \  | |  | | \  / | | | |  \| |
        #     / /\ \ | |  | | |\/| | | | | . ` |
        #    / ____ \| |__| | |  | |_| |_| |\  |
        #   /_/    \_\_____/|_|  |_|_____|_| \_|
        #
        #******************************************************************************************
        @self.app.route(SERVER_SUBDOMAIN + '/admin/local-galaxy-url', methods=['OPTIONS', 'GET'])
        def get_local_galaxy_url():
            if GALAXY_SERVER_URL == "":
                return Response().setContent({"GALAXY_SERVER_URL": GALAXY_SERVER}).getResponse()
            else:
                return Response().setContent({"GALAXY_SERVER_URL": GALAXY_SERVER_URL}).getResponse()

        @self.app.route(SERVER_SUBDOMAIN + '/admin/is-admin', methods=['OPTIONS', 'GET'])
        def is_admin():
            #1. First check if the session is valid
            response = forward_request("users/current", "GET")
            if response.status_code == 200:
                account_email = json.loads(response.data).get("email")
                if account_email == request.cookies.get("galaxyuser"):
                    return AdminFunctions.isAdminAccount(request, Response(), self.ROOT_DIRECTORY).getResponse()
            return Response().setContent({"success": False}).getResponse()

        @self.app.route(SERVER_SUBDOMAIN + '/admin/list-settings', methods=['OPTIONS', 'GET'])
        def list_settings():
            #FIRST CHECK IF THE SESSION IS VALID AND IS AN ADMIN ACCOUNT
            if not self.isFirstLaunch:
                isAdmin = is_admin()
                isAdmin = json.loads(isAdmin[0].data).get("success")
            else:
                isAdmin=True
            if isAdmin:
                return AdminFunctions.getSettingsList(request, Response(), self.ROOT_DIRECTORY).getResponse()
            return Response().setContent({"success": False}).setStatus(401).getResponse()

        @self.app.route(SERVER_SUBDOMAIN + '/admin/update-settings', methods=['OPTIONS', 'POST'])
        def update_settings():
            #FIRST CHECK IF THE SESSION IS VALID AND IS AN ADMIN ACCOUNT
            if not self.isFirstLaunch:
                isAdmin = is_admin()
                isAdmin = json.loads(isAdmin[0].data).get("success")
            else:
                isAdmin=True

            if isAdmin:
                response = AdminFunctions.updateSettings(request, Response(), self.ROOT_DIRECTORY, self.isFirstLaunch).getResponse()
                return response
            return Response().setContent({"success": False}).setStatus(401).getResponse()

    def iterform(self, multidict):
        for key in multidict.keys():
            for value in multidict.getlist(key):
                yield (key.encode("utf8"), value.encode("utf8"))

    def launch(self):
        ##*******************************************************************************************
        ##* LAUNCH APPLICATION
        ##*******************************************************************************************
        self.app.run(host=SERVER_HOST_NAME, port=SERVER_PORT_NUMBER,  debug=SERVER_ALLOW_DEBUG, threaded=True)

    def readConfigurationFile(self):
        self.ROOT_DIRECTORY = ROOT_DIRECTORY
        import os
        if self.ROOT_DIRECTORY == "":
            self.ROOT_DIRECTORY = os.path.abspath(os.path.dirname(os.path.realpath(__file__)) + "/../") + "/"
        else:
            self.ROOT_DIRECTORY = os.path.abspath(self.ROOT_DIRECTORY) + "/"

        #PREPARE LOGGING
        logging.config.fileConfig(self.ROOT_DIRECTORY + 'server/conf/logging.cfg')

        self.app.config['MAX_CONTENT_LENGTH'] =  SERVER_MAX_CONTENT_LENGTH * pow(1024,2)
        self.ADMIN_ACCOUNTS = ADMIN_ACCOUNTS.split(",")

class Response(object):
    """This class is used to specify the custom response object"""

    #****************************************************************
    # CONSTRUCTORS
    #****************************************************************
    def __init__(self):
        self.content=""
        self.status= 200
        #TODO: ENABLE THIS CODE??
        self.JSON_CONTENT_TYPE = {'Content-Type': 'application/json; charset=utf-8'}
        self.content_type = self.JSON_CONTENT_TYPE

    #****************************************************************
    # GETTERS AND SETTER
    #****************************************************************
    def setContent(self, content):
        self.content=content
        return self
    def getContent(self):
        return self.content

    def setStatus(self, status):
        self.status=status
        return self
    def getStatus(self):
        return self.status

    def setContentType(self, content_type):
        self.content_type=content_type
        return self
    def getContentType(self):
        return self.content_type

    def getResponse(self):
        return (jsonify(self.content), self.status, self.content_type)