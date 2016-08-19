import sys
import os

sys.path.insert(0, os.path.dirname(os.path.realpath(__file__)) + "/../")
os.chdir(os.path.dirname(os.path.realpath(__file__)) + "/../")

from server import Application

application = Application()
app = application.app

application.launch()
