from flask import Blueprint, render_template, request, g, current_app
import json
import mrpc
from flask_login import login_required

mod = Blueprint("mrpc", __name__, url_prefix="/api", template_folder="templates")


@mod.record
def mrpc_setup(setup_state):
    app = setup_state.app
    mod.MRPC = mrpc.MRPC(broadcast=app.config['BROADCAST_IP'], local_port=0)

@mod.route("/rpc", methods = ["POST"])
@login_required
def rpc():
    requestArgs = request.get_json()
    try:
        return json.dumps(mod.MRPC.rpc(timeout = 3, resend_delay = 0.12, **requestArgs).get())
    except Exception as e:
        print e
        return json.dumps({"error": str(e)}), 500

@mod.route("/mrpc.js", methods=["GET"])
def mrpcjs():
    return render_template("mrpc.js")


class FlaskForwarder(Blueprint):
    def __init__(self, *args, **kwargs):
        Blueprint.__init__(self, *args, **kwargs)
