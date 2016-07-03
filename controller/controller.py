from __future__ import print_function
import mrpc
from mrpc.transport import SocketTransport
from collections import defaultdict
import time

class Listener(mrpc.Service):
    def __init__(self):
        mrpc.Service.__init__(self)
        self.past_values = defaultdict(lambda: [])

    def listen(self, procedure):
        self._methods[procedure] = self.record(procedure)

    def record(self, procedure):
        def _record(value):
            self.past_values[procedure].append({"time": time.time(),"value": value})
        return _record

    @property
    def current_values(self):
        return {key: values[-1] for key, values in self.past_values.items() if values}
    

class Control(mrpc.Service):
    def __init__(self):
        mrpc.Service.__init__(self)
        self.services = {}

    @mrpc.service.method
    def listen(self, path, procedure):
        if path not in self.services:
            listener = Listener()
            self.services[path] = listener
            mrpc.register_service(listener, path)
        self.services[path].listen(procedure)

    @mrpc.service.method
    def past_values(self):
        return {path: dict(service.past_values) for path, service in self.services.items()}

    @mrpc.service.method
    def current_values(self):
        return {path: dict(service.current_values) for path, service in self.services.items()}

if __name__ == "__main__":
    mrpc.use_transport(SocketTransport(host = "192.168.1.4"))
    control = Control()
    mrpc.register_service(control)
    control.listen({"path": "/LivingRoom", "procedure": "temperature"})
    mrpc.LocalNode.run()
