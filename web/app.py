from flask import Flask, render_template
from flask import g
import mrpc
from flaskfix import fix, register
from mrpc.transport import SocketTransport
from flask_login import LoginManager, UserMixin, login_required
from fakedict import JSONFile

app = fix(Flask(__name__))
app.config.from_object('config')
register(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "auth.login"

@login_manager.user_loader
def load_user(userid):
    from mod_auth.controller import get
    return get(userid)

@app.route('/')
@login_required
def index():
    devices = JSONFile("devices.json")
    return render_template("index.html", dev_groups=devices)

@app.teardown_appcontext
def teardown_db(exception):
    db = getattr(g, '_mrpc', None)
    if db is not None:
        db.close()

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)
