from flask import Blueprint, render_template, request
from flask import g
import json
import mrpc
from flask.ext.login import login_required

mod = Blueprint("mrpc", __name__, url_prefix="/api", template_folder="templates")

MRPC = mrpc.MRPC()
MRPC.use_transport(mrpc.transport.SocketTransport(0))

@mod.route("/rpc", methods = ["POST"])
@login_required
def rpc():
    requestArgs = request.get_json()
    try:
        return json.dumps(MRPC.rpc(**requestArgs).get(timeout = 1))
    except Exception as e:
        return json.dumps({"error": str(e)}), 500

@mod.route("/mrpc.js", methods=["GET"])
def mrpcjs():
    return render_template("mrpc.js")


class FlaskForwarder(Blueprint):
    def __init__(self, *args, **kwargs):
        Blueprint.__init__(self, *args, **kwargs)