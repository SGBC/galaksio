import sys
import os


isFirstLaunch = False

if not os.path.isfile(os.path.dirname(os.path.realpath(__file__)) + "/conf/server.cfg"):
    print "Configuration not found, creating new settings file"
    import shutil
    conf_dir = os.path.dirname(os.path.realpath(__file__)) + "/conf/"
    res_dir = os.path.dirname(os.path.realpath(__file__)) + "/resources/"
    shutil.copyfile(res_dir + "__init__.py", conf_dir + "__init__.py")
    shutil.copyfile(res_dir + "example_serverconf.cfg", conf_dir + "server.cfg")
    shutil.copyfile(res_dir + "logging.cfg", conf_dir + "logging.cfg")
    isFirstLaunch = True
else:
    print "Configuration found, launching application"

os.chdir(os.path.dirname(os.path.realpath(__file__)) + "/../")
sys.path.insert(0, os.path.abspath(os.path.curdir))

try:
    from server import Application
except Exception as ex:
    from server.server import Application

application = Application()
application.isFirstLaunch = isFirstLaunch
app = application.app

application.launch()
