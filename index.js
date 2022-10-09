const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('battery.db');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

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
        // TODO
        // fetch data from networktables
    }
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post('/push', (req, res) => {
    let body = req.body || {};
    console.log(body);
    if (!(body.eventName != undefined && body.matchType != undefined && body.matchNum != undefined && body.replayNum != undefined && body.alliance != undefined && body.stationNum != undefined && body.matchTime != undefined && !isNaN(body.matchType) && !isNaN(body.matchNum) && !isNaN(body.replayNum) && !isNaN(body.stationNum) && !isNaN(body.matchTime) && (body.alliance == 'red' || body.alliance == 'blue'))) return res.json({ error: true, message: 'invalid input, input: ' + JSON.stringify(body) });
    body.eventName = body.eventName.toString();
    body.matchType = Number(body.matchType);
    body.matchNum = Number(body.matchNum);
    body.replayNum = Number(body.replayNum);
    body.alliance = body.alliance.toString();
    body.stationNum = Number(body.stationNum);
    body.matchTime = Number(body.matchTime);

    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS batteryData (eventName TEXT, matchType INTEGER, matchNum INTEGER, replayNum INTEGER, alliance TEXT, stationNum INTEGER, matchTime INTEGER)");

        db.run("INSERT INTO batteryData (eventName, matchType, matchNum, replayNum, alliance, stationNum, matchTime) VALUES (?, ?, ?, ?, ?, ?, ?)", [body.eventName, body.matchType, body.matchNum, body.replayNum, body.alliance, body.stationNum, body.matchTime], function(err) {
            if (err) return res.json({ error: true, message: err.toString() });
                return res.json({ error: false });
            });
    });
});

const listener = app.listen(5900, function() {
    console.log('Your app is listening on port ' + listener.address().port);
});