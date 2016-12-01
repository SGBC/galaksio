import sys
import os

os.chdir(os.path.dirname(os.path.realpath(__file__)) + "/../")
sys.path.insert(0, os.path.abspath(os.path.curdir))

isFirstLaunch = False

if not os.path.isfile(os.path.dirname(os.path.realpath(__file__)) + "/conf/serverconf.py"):
    import shutil
    conf_dir = os.path.dirname(os.path.realpath(__file__)) + "/conf/"
    res_dir = os.path.dirname(os.path.realpath(__file__)) + "/resources/"
    shutil.copyfile(res_dir + "example_serverconf.py", conf_dir + "__init__.py")
    shutil.copyfile(res_dir + "example_serverconf.py", conf_dir + "serverconf.py")
    shutil.copyfile(res_dir + "logging.cfg", conf_dir + "logging.cfg")
    isFirstLaunch = True

try:
    from server import Application
except Exception as ex:
    from server.server import Application

application = Application()
application.isFirstLaunch = isFirstLaunch
app = application.app

application.launch()
