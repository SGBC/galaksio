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
import requests
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
    import base64
    config = ConfigParser.RawConfigParser()

    prev_settings = readConfigurationFile()

    config.add_section('server_settings')
    config.set('server_settings', 'SERVER_HOST_NAME', newValues.get("SERVER_HOST_NAME"))
    config.set('server_settings', 'SERVER_SUBDOMAIN', newValues.get("SERVER_SUBDOMAIN"))
    config.set('server_settings', 'SERVER_PORT_NUMBER', str(newValues.get("SERVER_PORT_NUMBER")))
    config.set('server_settings', 'SERVER_ALLOW_DEBUG', str(newValues.get("SERVER_ALLOW_DEBUG")))
    config.set('server_settings', 'SAFE_UPLOAD', str(newValues.get("SAFE_UPLOAD") == True))
    config.set('server_settings', 'MAX_CONTENT_LENGTH', str(newValues.get("MAX_CONTENT_LENGTH")))
    config.set('server_settings', 'ROOT_DIRECTORY ', newValues.get("ROOT_DIRECTORY"))
    config.set('server_settings', 'TMP_DIRECTORY ', newValues.get("TMP_DIRECTORY"))

    config.add_section('galaxy_settings')
    config.set('galaxy_settings', 'GALAXY_SERVER', newValues.get("GALAXY_SERVER"))
    config.set('galaxy_settings', 'GALAXY_SERVER_URL', newValues.get("GALAXY_SERVER_URL"))
    config.set('galaxy_settings', 'ADMIN_ACCOUNTS', ",".join(newValues.get("ADMIN_ACCOUNTS")))

    config.add_section('smtp_settings')
    config.set('smtp_settings', 'SMTP_ACCOUNT', newValues.get("SMTP_ACCOUNT", ""))
    config.set('smtp_settings', 'SMTP_SERVER', newValues.get("SMTP_SERVER", ""))
    config.set('smtp_settings', 'SMTP_PORT', newValues.get("SMTP_PORT", ""))
    if prev_settings.SMTP_PASS != newValues.get("SMTP_PASS", ""):
        prev_settings.SMTP_PASS = base64.b64encode(newValues.get("SMTP_PASS", ""))
    config.set('smtp_settings', 'SMTP_PASS', prev_settings.SMTP_PASS)

    config.add_section('other_settings')
    config.set('other_settings', 'main_galaksio_server', "http://galaksio.thinksoftware.es/")
    config.set('other_settings', 'developers_email', "ebiokit@gmail.com")

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
    try:
        settings.SAFE_UPLOAD = config.getboolean('server_settings', 'SAFE_UPLOAD')
    except:
        settings.SAFE_UPLOAD = True

    try:
        settings.TMP_DIRECTORY = config.getboolean('server_settings', 'TMP_DIRECTORY')
    except:
        settings.TMP_DIRECTORY = "/tmp"

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

    try:
        settings.SMTP_ACCOUNT = config.get('smtp_settings', 'SMTP_ACCOUNT')
        settings.SMTP_PASS = config.get('smtp_settings', 'SMTP_PASS')
        settings.SMTP_SERVER = config.get('smtp_settings', 'SMTP_SERVER')
        settings.SMTP_PORT = config.getint('smtp_settings', 'SMTP_PORT')
    except:
        settings.SMTP_ACCOUNT = ""
        settings.SMTP_PASS = ""
        settings.SMTP_SERVER = ""
        settings.SMTP_PORT = 587

    try:
        settings.GALAKSIO_MAIN_SERVER = config.get('other_settings', 'main_galaksio_server')
        settings.DEVELOPERS_EMAIL = config.get('other_settings', 'developers_email')
    except:
        settings.GALAKSIO_MAIN_SERVER = "http://galaksio.thinksoftware.es/"
        settings.DEVELOPERS_EMAIL = "ebiokit@gmail.com"

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

def storeTmpFiles(files, tmp_dir):
    tmp_files = []
    for file_id in files.keys():
        file = files[file_id]
        tmp_path = os.path.join(tmp_dir, file.filename)
        file.save(tmp_path)
        tmp_files.append(tmp_path)
    return tmp_files


def sendErrorReport(request, response):
    settings = readConfigurationFile()
    newValues = json.loads(request.data)

    if settings.SMTP_ACCOUNT != "":
        try:
            import smtplib
            import base64
            from email.mime.multipart import MIMEMultipart
            from email.mime.text import MIMEText
            from email.mime.base import MIMEBase
            from email import encoders
            import tempfile

            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_ACCOUNT
            msg['To'] = settings.DEVELOPERS_EMAIL
            msg['Subject'] = "Galaksio error reporting."

            body = "Error type: " + str(newValues.get("error")) + "\n"
            body += "Galaksio server: " + str(settings.SERVER_HOST_NAME)+ "\n"
            body += "Galaksio subdomain: " + str(settings.SERVER_SUBDOMAIN)+ "\n"
            msg.attach(MIMEText(body, 'plain'))

            if newValues.get("tool") != None:
                fd, filename = tempfile.mkstemp()
                try:
                    with open(filename, 'w') as fd:
                        json.dump(newValues.get("tool"), fd)
                    fd.close()
                    attachment = open(filename, "rb")
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload((attachment).read())
                    encoders.encode_base64(part)
                    part.add_header('Content-Disposition', "attachment; filename= tool.json")
                    msg.attach(part)
                finally:
                    os.remove(filename)

            if newValues.get("input") != None:
                fd, filename = tempfile.mkstemp()
                try:
                    with open(filename, 'w') as fd:
                        json.dump(newValues.get("input"), fd)
                    fd.close()
                    attachment = open(filename, "rb")
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload((attachment).read())
                    encoders.encode_base64(part)
                    part.add_header('Content-Disposition', "attachment; filename= input.json")
                    msg.attach(part)
                finally:
                    os.remove(filename)

            server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_ACCOUNT, base64.b64decode(settings.SMTP_PASS))
            text = msg.as_string()
            server.sendmail(settings.SMTP_ACCOUNT, settings.DEVELOPERS_EMAIL, text)
            server.quit()

            response.setContent({"success": True})
        except Exception as ex:
            response.setStatus(401)
            response.setContent({"success": False, "developers_email": settings.DEVELOPERS_EMAIL})
    else:
        #ALTERNATIVE METHOD, FORWARD ERROR REPORT TO MAIN SERVER
        # STEP 1. Generate the new requests
        resp = requests.request(
            method=request.method,
            url=settings.GALAKSIO_MAIN_SERVER + '/admin/send-error-report',
            data=request.data,
            cookies=request.cookies,
            allow_redirects=False)

        response.setStatus(resp.status_code)
        if resp.status_code != 200:
            response.setContent({"success": False, "developers_email": settings.DEVELOPERS_EMAIL})
        else:
            response.setContent(resp.content)
    return response
