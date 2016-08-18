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

from flask import Flask, request, send_from_directory, jsonify
from flask.json import JSONEncoder
from re import sub

from conf.serverconf import *

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

    def launch(self):
        ##*******************************************************************************************
        ##* LAUNCH APPLICATION
        ##*******************************************************************************************
        self.app.run(host=SERVER_HOST_NAME, port=SERVER_PORT_NUMBER,  debug=SERVER_ALLOW_DEBUG )

    def readConfigurationFile(self):
        #PREPARE LOGGING
        #logging.config.fileConfig(ROOT_DIRECTORY + 'server/conf/logging.cfg')
        pass
