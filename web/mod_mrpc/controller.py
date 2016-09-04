from flask import Blueprint, render_template, request
from flask import g
import json
import mrpc
from flask_login import login_required

mod = Blueprint("mrpc", __name__, url_prefix="/api", template_folder="templates")

MRPC = mrpc.MRPC(broadcast="192.168.1.255", local_port=0)
#MRPC.use_transport(mrpc.transport.SocketTransport(host="192.168.1.222", broadcast="192.168.1.255"))

@mod.route("/rpc", methods = ["POST"])
@login_required
def rpc():
    requestArgs = request.get_json()
    try:
        return json.dumps(MRPC.rpc(timeout = 3, resend_delay = 0.12, **requestArgs).get())
    except Exception as e:
        return json.dumps({"error": str(e)}), 500

@mod.route("/mrpc.js", methods=["GET"])
def mrpcjs():
    return render_template("mrpc.js")


class FlaskForwarder(Blueprint):
    def __init__(self, *args, **kwargs):
        Blueprint.__init__(self, *args, **kwargs)
