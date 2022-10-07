let fmsData = { error: true, message: 'data not fetched yet' };

window.tables = {};
window.tables.fms = {};
window.tables.fms.getData = () => { return fmsData };
window.tables.smartDashboard = {};
window.tables.smartDashboard.getData = () => { return { error: true, message: 'TODO' } };

function update(data) {
    _data = data;
    if (_data.eventName == "") _data.eventName = "Unknown Event";
    if (_data.gameSpecificMessage == "") _data.gameSpecificMessage = "No Message";

    fmsData = _data || { error: true, message: 'unknown error' };

    let eventName = tables.fms.getData().eventName;
    let gameSpecificMessage = tables.fms.getData().gameSpecificMessage;
    let alliance = tables.fms.getData().isRedAlliance == true ? 'Red' : 'Blue';
    let matchNum = tables.fms.getData().matchNum;
    let matchType = tables.fms.getData().matchType;
    let replayNum = tables.fms.getData().replayNum;
    let stationNum = tables.fms.getData().stationNum;

    switch (matchType) {
        case 1:
            matchType = 'Practice';
            break;
        case 2:
            matchType = 'Qualification';
            break;
        case 3:
            matchType = 'Elimination';
            break;
        default:
            matchType = 'None';
    }

    switch (stationNum) {
        case 1:
            stationNum = `${alliance} Station 1`;
            break;
        case 2:
            stationNum = `${alliance} Station 2`;
            break;
        case 3:
            stationNum = `${alliance} Station 3`;
            break;
        default:
            stationNum = `${alliance} Unknown Station`;
    }

    $('#eventName').text(eventName);
    $('#gameSpecificMessage').text(gameSpecificMessage);
    $('#alliance').text(alliance);
    $('#matchNum').text(matchNum);
    $('#matchType').text(matchType);
    $('#replayNum').text(replayNum);
    $('#stationNum').text(stationNum);
}

$(document).ready(() => {
    $.getJSON("/fms", data => update(data));
    setInterval(() => $.getJSON("/fms?" + Date.now(), data => update(data)), 5000);
});