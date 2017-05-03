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
from server.conf.serverconf import ADMIN_ACCOUNTS
from flask import json

def isAdminAccount(request, response, ROOT_DIRECTORY):
    accounts = ADMIN_ACCOUNTS.replace(" ","").split(",")
    found = False
    for account in accounts:
        if account == request.cookies.get("galaxyuser"):
            found = True
            break
    response.setContent({"success": found})
    return response

def getSettingsList(request, response, ROOT_DIRECTORY, isFirstLaunch=False):
    response.setContent({"success": True, "settings": readSettingsFile(ROOT_DIRECTORY, isFirstLaunch)})
    return response

def updateSettings(request, response, ROOT_DIRECTORY, isFirstLaunch = False):
    #STEP 1. GET THE PREVIOUS SETTINGS LIST
    previousSettings = readSettingsFile(ROOT_DIRECTORY)
    newSettings = {}

    #STEP 2. UPDATE THE SETTINGS
    newValues = json.loads(request.data)

    for key,value in previousSettings.iteritems():
        newSettings[key] = newValues.get(key, value)

    content = ""
    with open(ROOT_DIRECTORY + "server/conf/serverconf.py", 'r') as f:
        for line in f:
            if line != "" and line[0] != "#":
                _line = line.split("=", 1)
                if len(_line) < 2:
                    content += line
                    continue

                setting_name = _line[0].replace(" ","")
                setting_value = _line[1].split(" ##")[0]
                setting_comment = _line[1].split(" ##")[1]

                newValue = newSettings.get(setting_name, setting_value)
                if newValue == None:
                    newValue = ""
                if setting_value.find("\"") != -1:
                    newValue = "\"" + str(newValue) + "\""

                content += _line[0] + "= " + str(newValue) + " ##" + setting_comment
            else:
                content += line
    f.close()

    from shutil import copyfile
    copyfile(ROOT_DIRECTORY + "server/conf/serverconf.py", ROOT_DIRECTORY + "server/conf/serverconf.py_back")

    with open(ROOT_DIRECTORY + "server/conf/serverconf.py", 'w') as f:
        f.write(content)
    f.close()

    response.setContent({"success": True, "isFirstLaunch" : isFirstLaunch})
    return response

def readSettingsFile(ROOT_DIRECTORY, isFirstLaunch=False):
    settings = {}
    with open(ROOT_DIRECTORY + "server/conf/serverconf.py") as f:
        for line in f:
            if line != "" and line[0] != "#":
                line = line.split("=", 1)
                if len(line) < 2:
                    continue
                setting_name = line[0].replace(" ","")
                setting_value = line[1].split(" ##")[0]

                if setting_value.find("\"") != -1:
                    setting_value = setting_value.split("\"")[1]
                else:
                    setting_value = setting_value.replace(" ","")
                settings[setting_name] = setting_value
    if isFirstLaunch:
        try:
            import os
            settings["IS_DOCKER"] = (os.environ["IS_DOCKER"] == '1')
        except Exception as ex:
            settings["IS_DOCKER"] = False

    return settings
