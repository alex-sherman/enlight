from __future__ import print_function
import RPi.GPIO as GPIO

class Door(object):
    def __init__(self, mrpc):
        self.mrpc = mrpc
        GPIO.setmode(GPIO.BOARD)
        GPIO.setup(7, GPIO.OUT)
        GPIO.output(7, False)

        @mrpc.service
        def buzz():
            GPIO.output(7, True)
            print("STARTED")
            self.mrpc.event(2, self._stop)
        buzz.respond("Door")

    def _stop(self):
        GPIO.output(7, False)
        print("STOPPED")

    def close(self):
        GPIO.cleanup()
