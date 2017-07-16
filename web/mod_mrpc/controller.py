from flask import Blueprint, render_template, request
from flask import g
import json
import mrpc
from flask_login import login_required, current_user

mod = Blueprint("mrpc", __name__, url_prefix="/api", template_folder="templates")

@mod.record
def mrpc_setup(setup_state):
    app = setup_state.app
    mod.MRPC = mrpc.MRPC(broadcast=app.config['BROADCAST_IP'], local_port=50123)

@mod.route("/rpc", methods = ["POST", "GET"])
def rpc():
    if not current_user.is_authenticated:
        return "Not authorized", 401
    if request.method == 'POST':
        requestArgs = request.get_json()
    if request.method == 'GET':
        try:
            requestArgs = json.loads(request.args.get("args"))
        except:
            return json.dumps({"error": "Invalid json in request args"}), 500
    try:
        print(requestArgs)
        return json.dumps(mod.MRPC.rpc(timeout = 1, resend_delay = 0.12, **requestArgs).get())
    except Exception as e:
        return json.dumps({"error": str(e)}), 500

@mod.route("/mrpc.js", methods=["GET"])
def mrpcjs():
    return render_template("mrpc.js")


class FlaskForwarder(Blueprint):
    def __init__(self, *args, **kwargs):
        Blueprint.__init__(self, *args, **kwargs)