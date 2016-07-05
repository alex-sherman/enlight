import sys, os
sys.path.insert(0, '/var/www/enlight')
os.chdir('/var/www/enlight')
from app import app
application = app
