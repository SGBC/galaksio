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

def getSettingsList(request, response, ROOT_DIRECTORY):
    #STEP 1. CHECK IF VALID USER

    #STEP 2. GET THE SETTINGS LIST
    response.setContent({"success": True, "settings": readSettingsFile(ROOT_DIRECTORY)})
    return response

def updateSettings(request, response, ROOT_DIRECTORY):
    #STEP 1. CHECK IF VALID USER

    #STEP 2. GET THE PREVIOUS SETTINGS LIST
    previousSettings = getSettingsList(request, ROOT_DIRECTORY)
    response.setContent({"success": True})
    return response

def readSettingsFile(ROOT_DIRECTORY):
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
    return settings
