from flask import Flask, render_template
from flask import g
import mrpc
from flaskfix import fix, register
from mrpc.transport import SocketTransport
from flask_login import LoginManager, UserMixin, login_required

from mod_mrpc.controller import mod as mod_mrpc
from fakedict import JSONFile
import json


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

@login_manager.request_loader
def load_user_from_request(request):
    key = None
    if 'api_key' in request.args:
        key = request.args.get('api_key')
    if 'api_key' in request.form:
        key = request.form['api_key']
    if key is not None:
        from mod_auth.controller import api_key
        return api_key(key)
    return None

@app.route('/')
@login_required
def index():
    layout = JSONFile("layout.json")
    return render_template("index.html", layout=json.dumps(layout.dict()))

@app.teardown_appcontext
def teardown_db(exception):
    db = getattr(g, '_mrpc', None)
    if db is not None:
        db.close()

if __name__ == "__main__":
    app.run(use_reloader = False, host='0.0.0.0', port=8080, debug=True)
