import sys
import os

import site
site.addsitedir('/datadev/b3g/server/venv/lib/python2.7/site-packages/') # Florida deployment

sys.path.insert(0, os.path.dirname(os.path.realpath(__file__)) + "/../")
os.chdir(os.path.dirname(os.path.realpath(__file__)) + "/../")

from server import Application

application = Application()
app = application.app

application.launch()
