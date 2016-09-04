import sys, os
sys.path.insert(0, '/root/enlight/web/')
os.chdir('/root/enlight/web/')
from app import app
application = app
