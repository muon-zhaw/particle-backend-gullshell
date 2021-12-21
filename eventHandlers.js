const logger = require('./db/logger.js');

exports.sendEvent = null;

exports.registerEventHandlers = function (source) {
    source.addEventListener('AlarmsystemActiveChanged', handleAlarmsystemActiveChanged);
    source.addEventListener('AlarmStatusChanged', handleAlarmsStatusChanged);
    // Register more event handlers here
}

function handleAlarmsystemActiveChanged(event) {
    // read variables from the event
    var data = {
        eventName: event.type,
        eventData: JSON.parse(event.data).data, // the value of the event
        deviceId: JSON.parse(event.data).coreid,
        timestamp: JSON.parse(event.data).published_at
    };

    //var datetime = new Date(data.timestamp); // convert the timestamp to a Date object

    try {        
        // you can add more properties to your data object
        data.myMessage = "Alarmsystem status changend";

        // send data to all connected clients
        exports.sendEvent(data);
    } catch (error) {
        console.log("Could not handle event: " + JSON.stringify(event) + "\n");
        console.log(error)
    }
}

function handleAlarmsStatusChanged(event) {
    // read variables from the event
    var data = {
        eventName: event.type,
        eventData: JSON.parse(event.data).data, // the value of the event
        deviceId: JSON.parse(event.data).coreid,
        timestamp: JSON.parse(event.data).published_at
    };
    // you can add more properties to your data object
    data.myMessage = "Alarm status changend";
    //var datetime = new Date(data.timestamp); // convert the timestamp to a Date object

    try {        
        // you can add more properties to your data object
        data.myMessage = "Alarm was set to true"; 
        
        //data.temperatures = JSON.stringify(getTemperatureArray(false));    
        //data.temperatures = JSON.stringify(temp);
        //may held over the array of alarms over time?

        // Log the event in the database
        logger.logOne("MyDB", "AlarmStatusChanged", data);

        // send data to all connected clients
        exports.sendEvent(data);
    } catch (error) {
        console.log("Could not handle event: " + JSON.stringify(event) + "\n");
        console.log(error)
    }
}