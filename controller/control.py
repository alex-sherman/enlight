from __future__ import print_function
import mrpc
from mrpc.transport import SocketTransport
from collections import defaultdict
import time

class Listener(object):
    def __init__(self):
        self.past_values = defaultdict(lambda: [])

    def record(self, path):
        def _record(value):
            values = self.past_values[path]
            values.append({"time": time.time(),"value": value})
            if(len(values) > 10):
                self.past_values[path] = values[-10:]
        return _record

    @property
    def current_values(self):
        return {key: values[-1] for key, values in self.past_values.items() if values}
    

class Control(object):
    def __init__(self, mrpc):
        self.mrpc = mrpc
        self.services = {}

    def listen(self, path, procedure):
        if procedure not in self.services:
            listener = Listener()
            self.services[procedure] = (listener, self.mrpc.service(listener.record(path), procedure))
        self.services[procedure][1].respond(path)

    def past_values(self):
        return {path: dict(service.past_values) for path, service in self.services.items()}

    def current_values(self):
        return {path: dict(service[0].current_values) for path, service in self.services.items()}

