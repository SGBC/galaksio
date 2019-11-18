import os
import shutil

from .server import Application

isFirstLaunch = False
isDocker = False

if not os.path.isfile(os.path.dirname(os.path.realpath(__file__)) + "/conf/server.cfg"):
    print("Configuration not found, creating new settings file")
    conf_dir = os.path.dirname(os.path.realpath(__file__)) + "/conf/"
    res_dir = os.path.dirname(os.path.realpath(__file__)) + "/resources/"
    shutil.copyfile(res_dir + "__init__.py", conf_dir + "__init__.py")
    shutil.copyfile(res_dir + "example_serverconf.cfg", conf_dir + "server.cfg")
    shutil.copyfile(res_dir + "logging.cfg", conf_dir + "logging.cfg")
    isFirstLaunch = True
else:
    print("Configuration found, launching application")

application = Application()
application.isFirstLaunch = isFirstLaunch
application.isDocker = isDocker
app = application.app

application.launch()
