let tableData = { error: true, message: 'data not fetched yet' };
let monitorActive = false;
let interval = setInterval(() => { }, 5000);

window.tables = {};
window.tables.getData = () => { return tableData };

function update(fms, battery) {
    _data = fms;
    if (_data.eventName == "") _data.eventName = "Unknown Event";
    if (_data.gameSpecificMessage == "") _data.gameSpecificMessage = "No Message";

    tableData = _data || { error: true, message: 'unknown error' };
    tableData.voltage = battery.voltage;
    tableData.matchTime = battery.matchTime;
    tableData.isTeleop = battery.isTeleop;
    tableData.isAutonomous = battery.isAutonomous;
    tableData.batteryName = battery.batteryName;

    let eventName = tables.getData().eventName;
    let gameSpecificMessage = tables.getData().gameSpecificMessage;
    let alliance = tables.getData().isRedAlliance == true ? 'Red' : 'Blue';
    let matchNum = tables.getData().matchNum;
    let matchType = tables.getData().matchType;
    let replayNum = tables.getData().replayNum;
    let stationNum = tables.getData().stationNum;
    let voltage = tables.getData().voltage;
    let matchTime = tables.getData().matchTime;
    let isTeleop = tables.getData().isTeleop;
    let isAutonomous = tables.getData().isAutonomous;
    let batteryName = tables.getData().batteryName;

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
    $('#batteryVoltage').text(voltage);
    $('#matchTime').text(matchTime);
    $('#isTeleop').text(isTeleop);
    $('#isAutonomous').text(isAutonomous);
    $('#batteryName').text(batteryName);
}

$(document).ready(() => {
    $('#startButton').click(() => {
        if ($('#monitorInterval').val().trim() == '' && !monitorActive) return;
        monitorActive = !monitorActive;
        clearInterval(interval);
        if (monitorActive) {
            $('#startButton').text('Stop Monitoring');
            $('#startButton').removeClass('is-success');
            $('#startButton').addClass('is-danger');
            interval = setInterval(() => {
                $('#monitorBar').removeAttr('value');
                $.getJSON('/fms?' + Date.now(), fms => {
                    $.getJSON('/battery?' + Date.now(), battery => {
                        update(fms, battery);
                        data = {
                            eventName: tables.getData().eventName,
                            matchType: tables.getData().matchType,
                            matchNum: tables.getData().matchNum,
                            replayNum: tables.getData().replayNum,
                            alliance: tables.getData().isRedAlliance == true ? 'red' : 'blue',
                            stationNum: tables.getData().stationNum,
                            voltage: tables.getData().voltage,
                            matchTime: tables.getData().matchTime,
                            isTeleop: Boolean(tables.getData().isTeleop),
                            isAutonomous: Boolean(tables.getData().isAutonomous),
                            batteryName: tables.getData().batteryName
                        };
                        console.log(data);
                        $.ajax({
                            method: "POST",
                            url: "/push",
                            data: data
                        }).done(msg => {
                            if (msg.error == true) {
                                alert('Error occurred while logging data in database:\n' + JSON.stringify(msg));
                            }
                        });
                    });
                });
            }, Number($('#monitorInterval').val().trim()));
        } else {
            $('#startButton').text('Start Monitoring');
            $('#startButton').addClass('is-success');
            $('#startButton').removeClass('is-danger');
            $('#monitorBar').attr('value', 0);
        }
    });
});