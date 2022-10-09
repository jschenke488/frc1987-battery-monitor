# [Broncobots](https://teambroncobots.com) Battery Monitor

## Installation

You'll need to install [Python](https://www.python.org) and [Node.js](https://nodejs.org) before continuing

### Cloning
1. `git clone https://github.com/jschenke488/frc1987-battery-monitor.git`
2. `cd frc1987-battery-monitor`

### Python server (required to access NetworkTables)

You may need to [install Rust](https://rustup.rs) for some RobotPy depenedencies

3. In config.json, set networkTablesDebug to false and networkTablesRobotHost to the IP of your roboRIO. This should be 10.XX.XX.2 where XX.XX is your team number. For example, the Broncobots is 1987 so the IP would be 10.19.87.2.
4. `pip install werkzeug robotpy pynetworktables flask`
5. `python app.py`

### Running the application

6. `npm i`
7. `npm start`

Instructions for running on Raspberry Pi coming soon
