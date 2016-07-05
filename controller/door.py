from __future__ import print_function
import mrpc
import RPi.GPIO as GPIO

class Door(mrpc.Service):
    def __init__(self):
        mrpc.Service.__init__(self)
        GPIO.setmode(GPIO.BOARD)
        GPIO.setup(7, GPIO.OUT)
    @mrpc.service.method
    def buzz(self):
        GPIO.output(7, True)
        print("STARTED")
        mrpc.LocalNode.event(2, self._stop)

    def _stop(self):
        GPIO.output(7, False)
        print("STOPPED")

    def close(self):
        GPIO.cleanup()