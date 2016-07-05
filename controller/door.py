from __future__ import print_function
import mrpc

class Door(mrpc.Service):
    @mrpc.service.method
    def buzz(self):
        print("STARTED")
        mrpc.LocalNode.event(2, lambda: print("STOPPED"))