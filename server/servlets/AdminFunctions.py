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
from flask import json, jsonify
import logging
from logging import config as loggingConfig
import os

def isAdminAccount(request, response, ROOT_DIRECTORY):
    settings = readConfigurationFile()
    accounts = settings.ADMIN_ACCOUNTS
    response.setContent({"success": (request.cookies.get("galaxyuser") in accounts)})
    return response

def getSettingsList(request, response, ROOT_DIRECTORY, isFirstLaunch=False, isDocker=False):
    response.setContent({"success": True, "settings": readConfigurationFile(isFirstLaunch, isDocker).__dict__})
    return response

def updateSettings(request, response, ROOT_DIRECTORY, isFirstLaunch = False):
    #STEP 1. BACKUP SETTINGS
    from shutil import copyfile
    copyfile(ROOT_DIRECTORY + "server/conf/server.cfg", ROOT_DIRECTORY + "server/conf/server.cfg_back")

    #STEP 2. READ NEW SETTINGS
    newValues = json.loads(request.data)

    import ConfigParser
    config = ConfigParser.RawConfigParser()

    config.add_section('server_settings')
    config.set('server_settings', 'SERVER_HOST_NAME', newValues.get("SERVER_HOST_NAME"))
    config.set('server_settings', 'SERVER_SUBDOMAIN', newValues.get("SERVER_SUBDOMAIN"))
    config.set('server_settings', 'SERVER_PORT_NUMBER', str(newValues.get("SERVER_PORT_NUMBER")))
    config.set('server_settings', 'SERVER_ALLOW_DEBUG', str(newValues.get("SERVER_ALLOW_DEBUG")))
    config.set('server_settings', 'MAX_CONTENT_LENGTH', str(newValues.get("MAX_CONTENT_LENGTH")))
    config.set('server_settings', 'ROOT_DIRECTORY ', newValues.get("ROOT_DIRECTORY"))

    config.add_section('galaxy_settings')
    config.set('galaxy_settings', 'GALAXY_SERVER', newValues.get("GALAXY_SERVER"))
    config.set('galaxy_settings', 'GALAXY_SERVER_URL', newValues.get("GALAXY_SERVER_URL"))
    config.set('galaxy_settings', 'ADMIN_ACCOUNTS', ",".join(newValues.get("ADMIN_ACCOUNTS")))

    #STEP 3 Writing our configuration file to 'server.cfg'
    with open(ROOT_DIRECTORY + "server/conf/server.cfg", 'wb') as configfile:
        config.write(configfile)
    configfile.close()

    response.setContent({"success": True, "isFirstLaunch" : isFirstLaunch})
    return response

def readConfigurationFile(isFirstLaunch=False, isDocker=False):
    import ConfigParser
    import os

    class Settings(object):
        pass
    settings= Settings()

    config = ConfigParser.RawConfigParser()
    config.read(os.path.dirname(os.path.realpath(__file__)) + "/../conf/server.cfg")

    settings.SERVER_HOST_NAME = config.get('server_settings', 'SERVER_HOST_NAME')
    settings.SERVER_SUBDOMAIN = config.get('server_settings', 'SERVER_SUBDOMAIN')
    settings.SERVER_PORT_NUMBER = config.getint('server_settings', 'SERVER_PORT_NUMBER')
    settings.SERVER_ALLOW_DEBUG = config.getboolean('server_settings', 'SERVER_ALLOW_DEBUG')
    settings.MAX_CONTENT_LENGTH = config.getint('server_settings', 'MAX_CONTENT_LENGTH')
    settings.ROOT_DIRECTORY = config.get('server_settings', 'ROOT_DIRECTORY')
    import os
    if settings.ROOT_DIRECTORY == "":
        settings.ROOT_DIRECTORY = os.path.abspath(os.path.dirname(os.path.realpath(__file__)) + "/../../") + "/"
    else:
        settings.ROOT_DIRECTORY = os.path.abspath(settings.ROOT_DIRECTORY) + "/"

    settings.GALAXY_SERVER = config.get('galaxy_settings', 'GALAXY_SERVER').rstrip("/")
    settings.GALAXY_SERVER_URL = config.get('galaxy_settings', 'GALAXY_SERVER_URL').rstrip("/")
    settings.ADMIN_ACCOUNTS = config.get('galaxy_settings', 'ADMIN_ACCOUNTS').split(",")
    # PREPARE LOGGING
    loggingConfig.fileConfig(settings.ROOT_DIRECTORY + 'server/conf/logging.cfg')

    settings.IS_DOCKER = isDocker

    if isFirstLaunch:
        import os
        failed = 0
        settings.AUTO_INSTALL = True

        try:
            settings.GALAXY_SERVER = os.environ["GALAXY_SERVER"]
            settings.IS_DOCKER = True
        except Exception as ex:
            failed = failed + 1

        try:
            settings.GALAXY_SERVER_URL = os.environ["GALAXY_SERVER_URL"]
            settings.IS_DOCKER = True
        except Exception as ex:
            failed = failed + 1

        try:
            settings.MAX_CONTENT_LENGTH = os.environ["MAX_CONTENT_LENGTH"]
            settings.IS_DOCKER = True
        except Exception as ex:
            failed = failed + 1

        try:
            settings.ADMIN_ACCOUNTS = os.environ["ADMIN_ACCOUNTS"]
            settings.IS_DOCKER = True
        except Exception as ex:
            failed = failed + 1

        if failed > 0:
            settings.IS_DOCKER = isDocker
            settings.AUTO_INSTALL = False

    return settings

def storeTmpFiles(files):
    tmp_files = {}
    for file_id in files.keys():
        file = files[file_id]
        tmp_path = os.path.join("/tmp", file.filename)
        file.save(tmp_path)
        tmp_files[file_id] = (file.filename, open(tmp_path, 'rb'), 'text/plain')
    return tmp_files

