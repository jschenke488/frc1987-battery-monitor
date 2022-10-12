import json
f = open('config.json')
config = json.load(f)
server = config['networkTablesRobotHost']
f.close()

import time
import werkzeug
from networktables import NetworkTables
from flask import Flask, send_from_directory

# To see messages from networktables, you must setup logging
import logging
logging.basicConfig(level=logging.DEBUG)

# initialize connection to robot
NetworkTables.initialize(server=server)
sd = NetworkTables.getTable("SmartDashboard") # get smartdashboard from networktables
fms = NetworkTables.getTable("FMSInfo") # fms info

def getFMSEntries():
    # default values are never actually used
    # should report this to https://github.com/robotpy/pynetworktables
    if (NetworkTables.isConnected()):
        entries = {
            'eventName': fms.getEntry('EventName').getString(''),
            'fmsControlData': fms.getEntry('FMSControlData').getDouble(-1),
            'gameSpecificMessage': fms.getEntry('GameSpecificMessage').getString(''),
            'isRedAlliance': fms.getEntry('IsRedAlliance').getBoolean(True),
            'matchNum': fms.getEntry('MatchNumber').getDouble(-1),
            'matchType': fms.getEntry('MatchType').getDouble(-1),
            'replayNum': fms.getEntry('ReplayNumber').getDouble(-1),
            'stationNum': fms.getEntry('StationNumber').getDouble(-1),
            'error': False
        }
        return entries
    else:
        return {
            'error': True,
            'message': 'not connected to robot'
        }

app = Flask(__name__)

@app.route("/fms")
def fmsRoute():
    return getFMSEntries()

if __name__ == "__main__":
    app.run(port=5900)