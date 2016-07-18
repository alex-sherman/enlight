# Statement for enabling the development environment
DEBUG = True

# Define the application directory
import os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))  

# Application threads. A common general assumption is
# using 2 per available processor cores - to handle
# incoming requests using one and performing background
# operations using the other.
THREADS_PER_PAGE = 2

# Enable protection agains *Cross-site Request Forgery (CSRF)*
CSRF_ENABLED     = True

# Use a secure, unique and absolutely secret key for
# signing the data. 
CSRF_SESSION_KEY = "o72w4s2cjtn0d9qf-5fg7&muzc=df2e)f^r0+&%&q==q-md1b&"

# Secret key for signing cookies
SECRET_KEY = "iy!+rg5p#w#3$m5ws02r^!@fq_z878-w8x92sd((ni03ueiptn"

BROADCAST_IP = "192.168.1.255"