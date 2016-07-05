import mrpc
from mrpc.transport import SocketTransport
from control import Control
from door import Door

if __name__ == "__main__":
    mrpc.use_transport(SocketTransport())
    control = Control()
    mrpc.register_service(control)
    control.listen({"path": "/LivingRoom", "procedure": "temperature"})
    mrpc.register_service(Door())
    mrpc.LocalNode.run()