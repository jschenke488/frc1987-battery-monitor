teamNum = '1987'
server = '10.' + teamNum[0:2] + '.' + teamNum[2:4] + '.2' # 10.19.87.2

import time
import werkzeug
from networktables import NetworkTables
from flask import Flask, send_from_directory

# To see messages from networktables, you must setup logging
import logging
logging.basicConfig(level=logging.INFO)

# initialize connection to robot
NetworkTables.initialize(server=server)
sd = NetworkTables.getTable("SmartDashboard") # get smartdashboard from networktables
fms = NetworkTables.getTable("FMSInfo") # fms info

def getFMSEntries():
    entries = {
        'eventName': fms.getEntry('EventName').getString(''),
        'fmsControlData': fms.getEntry('FMSControlData').getDouble(-1),
        'gameSpecificMessage': fms.getEntry('GameSpecificMessage').getString(''),
        'isRedAlliance': fms.getEntry('IsRedAlliance').getBoolean(True),
        'matchNum': fms.getEntry('MatchNumber').getDouble(-1),
        'matchType': fms.getEntry('MatchType').getDouble(-1),
        'replayNum': fms.getEntry('ReplayNumber').getDouble(-1),
        'stationNum': fms.getEntry('StationNumber').getDouble(-1),
    }
    # entries = {'eventName': '', 'fmsControlData': 0.0, 'gameSpecificMessage': '', 'isRedAlliance': True, 'matchNum': 0.0, 'matchType': 0.0, 'replayNum': 0.0, 'stationNum': 1.0, 'error': False}
    return entries

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello, world!"

@app.route("/fms")
def fmsRoute():
    return getFMSEntries()

@app.route("/dash", defaults={'path': 'index.html'})
@app.route("/dash/", defaults={'path': 'index.html'})
@app.route("/dash/<path:path>")
def staticRoute(path):
    try:
        return send_from_directory('dash', path)
    except werkzeug.exceptions.NotFound as e:
        if path.endswith("/"):
            return send_from_directory('dash', path + "index.html")
        raise e

def connectionListener(connected, info):
    logging.info(getFMSEntries())
NetworkTables.addConnectionListener(connectionListener, immediateNotify=True)

if __name__ == "__main__":
    app.run()