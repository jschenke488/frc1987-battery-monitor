const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('battery.db');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const axios = require('axios');

const { networkTablesHost, networkTablesDebug } = require('./config.json');

app.use('/dash', express.static('dash'));

app.get('/', (req, res) => {
    res.redirect('/dash/');
});

app.get('/fms', (req, res) => {
    if (networkTablesDebug == true) {
        return res.json({
            'eventName': '',
            'fmsControlData': 0,
            'gameSpecificMessage': '',
            'isRedAlliance': true,
            'matchNum': 0,
            'matchType': 0,
            'replayNum': 0,
            'stationNum': 1,
            'error': false
        });
    } else {
        axios.get(`http://${networkTablesHost}/fms`).then(_response => {
            let response = _response.data;
            if (!(response.eventName != undefined && response.fmsControlData != undefined && response.gameSpecificMessage != undefined && response.isRedAlliance != undefined && response.matchNum != undefined && response.matchType != undefined && response.replayNum != undefined && response.stationNum != undefined && response.error != undefined)) {
                let tmp = response;
                response.error = true;
                response.message = 'missing fields in FMS query from host, response: ' + JSON.stringify(tmp);
                return res.json(response);
            }
            if (response.error == true && response.message == undefined) {
                response.message = 'unknown error, error message not sent from host';
                return res.json(response);
            }
            if (isNaN(response.fmsControlData) || (response.isRedAlliance != true && response.isRedAlliance != false) || isNaN(response.matchNum) || isNaN(response.matchType) || isNaN(response.replayNum) || isNaN(response.stationNum) || (response.error != true && response.error != false)) {
                let tmp = response;
                response.error = 'unexpected value in FMS query, response: ' + JSON.stringify(tmp);
                return res.json(response);
            }
            return res.json(response);
        }).catch(err => {
            return res.json({ error: true, message: err.toString() });
        });
    }
});

app.get('/battery', (req, res) => {
    if (networkTablesDebug == true) {
        return res.json({
            'voltage': 0.0,
            'matchTime': -1.0,
            'isTeleop': false,
            'isAutonomous': false,
            'batteryName': 'Battery 1',
            'error': false
        });
    } else {
        axios.get(`http://${networkTablesHost}/battery`).then(_response => {
            let response = _response.data;
            if (!(response.voltage != undefined && response.matchTime != undefined && response.isTeleop != undefined && response.isAutonomous != undefined && response.error != undefined && response.batteryName != undefined)) {
                let tmp = response;
                response.error = true;
                response.message = 'missing fields in battery query from host, response: ' + JSON.stringify(tmp);
                return res.json(response);
            }
            if (response.error == true && response.message == undefined) {
                response.message = 'unknown error, error message not sent from host';
                return res.json(response);
            }
            if (isNaN(response.voltage) || isNaN(response.matchTime) || (response.isTeleop != true && response.isTeleop != false) || (response.isAutonomous != true && response.isAutonomous != false) || (response.error != true && response.error != false)) {
                let tmp = response;
                response.error = 'unexpected value in battery query, response: ' + JSON.stringify(tmp);
                return res.json(response);
            }
            return res.json(response);
        }).catch(err => {
            return res.json({ error: true, message: err.toString() });
        });
    }
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post('/push', (req, res) => {
    let body = req.body || {};
    console.log(body);
    body.eventName = body.eventName.toString();
    body.matchType = Number(body.matchType);
    body.matchNum = Number(body.matchNum);
    body.replayNum = Number(body.replayNum);
    body.alliance = body.alliance.toString();
    body.stationNum = Number(body.stationNum);
    body.matchTime = Number(body.matchTime);
    body.voltage = Number(body.voltage);
    body.matchTime = Number(body.matchTime);
    if (body.isTeleop == 1) body.isTeleop = 1;
    else if (body.isTeleop == true) body.isTeleop = true;
    else body.isTeleop = false;
    if (body.isAutonomous == 1) body.isAutonomous = 1;
    else if (body.isAutonomous == true) body.isAutonomous = true;
    else body.isAutonomous = false;
    body.batteryName = body.batteryName.toString();

    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS batteryData (eventName TEXT, matchType INTEGER, matchNum INTEGER, replayNum INTEGER, alliance TEXT, stationNum INTEGER, matchTime INTEGER, voltage REAL, isTeleop INTEGER, isAutonomous INTEGER, batteryName TEXT)");

        db.run("INSERT INTO batteryData (eventName, matchType, matchNum, replayNum, alliance, stationNum, matchTime, voltage, isTeleop, isAutonomous, batteryName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [body.eventName, body.matchType, body.matchNum, body.replayNum, body.alliance, body.stationNum, body.matchTime, body.voltage, body.isTeleop, body.isAutonomous, body.batteryName], function(err) {
            if (err) return res.json({ error: true, message: err.toString() });
                return res.json({ error: false });
            });
    });
});

app.get('/getData', (req, res) => {
    res.type('text/csv');
    res.header('Content-Disposition', 'attachment;filename=batteryData.csv');

    let response = "eventName,matchType,matchNum,replayNum,alliance,stationNum,matchTime,voltage,isTeleop,isAutonomous,batteryName\n";
    db.serialize(() => {
        db.each("SELECT rowid AS id, eventName, matchType, matchNum, replayNum, alliance, stationNum, matchTime, voltage, isTeleop, isAutonomous, batteryName FROM batteryData", (err, row) => {
            console.log(row.id + ": " + row.voltage);
            response += `"${row.eventName}",${row.matchType},${row.matchNum},${row.replayNum},"${row.alliance}",${row.stationNum},${row.matchTime},${row.voltage},${row.isTeleop},${row.isAutonomous},"${row.batteryName}"\n`;
        }, () => {
            res.send(response);
        });
    })
})

const listener = app.listen(5901, function() {
    console.log('Your app is listening on port ' + listener.address().port);
});