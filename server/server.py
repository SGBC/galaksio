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
import urllib
import httplib
import re
import urllib
import urlparse

from flask import Flask, request, send_from_directory, jsonify, request, abort, Response, redirect, stream_with_context, url_for
from flask.json import JSONEncoder
from re import sub
from werkzeug.datastructures import Headers
from werkzeug.exceptions import NotFound

from conf.serverconf import *

from servlets.GalaxyAPI import passRequestToAPI

HTML_REGEX = re.compile(r'((?:src|action|href)=["\'])/')
JQUERY_REGEX = re.compile(r'(\$\.(?:get|post)\(["\'])/')
JS_LOCATION_REGEX = re.compile(r'((?:window|document)\.location.*=.*["\'])/')
CSS_REGEX = re.compile(r'(url\(["\']?)/')

REGEXES = [HTML_REGEX, JQUERY_REGEX, JS_LOCATION_REGEX, CSS_REGEX]

class Application(object):
    #******************************************************************************************************************
    # CONSTRUCTORS
    #******************************************************************************************************************
    def __init__(self):
        ##*******************************************************************************************
        ##****SERVLET DEFINITION*********************************************************************
        ##*******************************************************************************************
        self.readConfigurationFile()
        self.app = Flask(__name__)

        self.app.config['MAX_CONTENT_LENGTH'] =  SERVER_MAX_CONTENT_LENGTH

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
            return send_from_directory(ROOT_DIRECTORY + 'client/src/', 'index.html')
        ##*******************************************************************************************
        ##* GET FILE
        ##*******************************************************************************************
        @self.app.route(SERVER_SUBDOMAIN + '/<path:filename>')
        def get_static(filename):
            return send_from_directory(ROOT_DIRECTORY + 'client/src/', filename)

        #******************************************************************************************
        #     _____          _               __   ____     __           _____ _____
        #    / ____|   /\   | |        /\    \ \ / /\ \   / /     /\   |  __ \_   _|
        #   | |  __   /  \  | |       /  \    \ V /  \ \_/ /     /  \  | |__) || |
        #   | | |_ | / /\ \ | |      / /\ \    > <    \   /     / /\ \ |  ___/ | |
        #   | |__| |/ ____ \| |____ / ____ \  / . \    | |     / ____ \| |    _| |_
        #    \_____/_/    \_\______/_/    \_\/_/ \_\   |_|    /_/    \_\_|   |_____|
        #
        #******************************************************************************************
        @self.app.route(SERVER_SUBDOMAIN + '/api/<path:service>', methods=['OPTIONS', 'POST', 'GET'])
        def passRequest(service):
            # STEP 1. Read requests auth params
            auth = None
            if request.authorization is not None and len(request.authorization) > 0:
                auth = ()
                for i in request.authorization:
                    auth = auth + (request.authorization[i],)

            # STEP 2. Generate the new requests
            resp = requests.request(
                method=request.method,
                url= GALAXY_SERVER + GALAXY_SUBDOMAIN + '/api/' + service,
                # headers={key: value for (key, value) in request.headers if key != 'Host'},
                params= dict(request.args),
                data=request.get_data(),
                auth=auth,
                cookies=request.cookies,
                allow_redirects=False)

            # headers = []
            # excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
            # headers = [(name, value) for (name, value) in resp.raw.headers.items()
            #            if name.lower() not in excluded_headers]

            response = Response(resp.content, resp.status_code, resp.raw.headers.items())
            return response

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
        #PREPARE LOGGING
        logging.config.fileConfig(ROOT_DIRECTORY + 'server/conf/logging.cfg')
