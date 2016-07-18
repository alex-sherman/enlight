import mrpc
from mrpc.transport import SocketTransport
from control import Control
from door import Door

if __name__ == "__main__":
    MRPC = mrpc.MRPC()
    MRPC.use_transport(SocketTransport())
    control = Control(MRPC)
    MRPC.service(control.listen).respond("Control")
    MRPC.service(control.past_values).respond("Control")
    MRPC.service(control.current_values).respond("Control")
    control.listen(**{"path": "/LivingRoom", "procedure": "temperature"})
    Door(MRPC)
    MRPC.run()