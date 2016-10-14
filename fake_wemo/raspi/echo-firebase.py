""" fauxmo_minimal.py - Fabricate.IO

    This is a demo python file showing what can be done with the debounce_handler.
    The handler prints True when you say "Alexa, device on" and False when you say
    "Alexa, device off".

    If you have two or more Echos, it only handles the one that hears you more clearly.
    You can have an Echo per room and not worry about your handlers triggering for
    those other rooms.

    The IP of the triggering Echo is also passed into the act() function, so you can
    do different things based on which Echo triggered the handler.
"""

import fauxmo
import logging
import time

from debounce_handler import debounce_handler

logging.basicConfig(level=logging.DEBUG)



from firebase import Firebase

f = Firebase('https://echo-firebase.firebaseio.com/',auth_token="ssbFuyPpddo5uIPpJozR7gYxznpB0BRcu5wENvvV")


class firebase_handler(object):
    def __init__(self, device):
        self.device = device
        #self.on_cmd = on_cmd
        #self.off_cmd = off_cmd

    def on(self, addr):
        print "FB HANDLER ON ", addr
        f.child('/devices/%s' % self.device).set(True)
        return True

    def off(self, addr):
        print "FB HANDLER OFF ", addr
        f.child('/devices/%s' % self.device).set(False)
        return True





class device_handler(debounce_handler):
    """Publishes the on/off state requested,
       and the IP address of the Echo making the request.
    """
    TRIGGERS = {"siren": 52000, "giro": 52003, "shirt": 52004 }

    def act(self, client_address, state):
        print "State", state, "from client @", client_address
        return True



if __name__ == "__main__":
    # Startup the fauxmo server
    fauxmo.DEBUG = True
    p = fauxmo.poller()
    u = fauxmo.upnp_broadcast_responder()
    u.init_socket()
    p.add(u)

    # Register the device callback as a fauxmo handler
    d = device_handler()
    for trig, port in d.TRIGGERS.items():
        fauxmo.fauxmo(trig, u, p, None, port, firebase_handler(trig))

    # Loop and poll for incoming Echo requests
    logging.debug("Entering fauxmo polling loop")
    while True:
        try:
            # Allow time for a ctrl-c to stop the process
            p.poll(100)
            time.sleep(0.1)
        except Exception, e:
            logging.critical("Critical exception: " + str(e))
            break

