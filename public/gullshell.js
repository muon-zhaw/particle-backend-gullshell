var rootUrl = window.location.origin; // get the root URL, e.g. https://example.herokuapp.com or http://localhost:3001

// initialise server-sent events
function initSSE() {
    if (typeof (EventSource) !== "undefined") {
        var url = rootUrl + "/api/events";
        var source = new EventSource(url);
        source.onmessage = (event) => {
            updateVariables(JSON.parse(event.data));
        };
    } else {
        alert("Your browser does not support server-sent events.");
    }
}
initSSE();

function updateVariables(data) {
    // update the html elements
    document.getElementById("lastevent").innerHTML = JSON.stringify(data);
    if (data.eventName === "MyEvent") {
        document.getElementById("counterevent").innerHTML = data.eventData; 
    }
    if (data.eventName === "training-start") {
        document.getElementById("training-status").innerHTML = "Training aktiv :-)....*go go go!*";
    }
    if (data.eventName === "training-cadence") {
        document.getElementById("training-cadence").innerHTML = data.eventData;
    }
    if (data.eventName === "training-movements") {
        document.getElementById("training-movements").innerHTML = data.eventData;
    }
    if (data.eventName === "training-cadence-avg") {
        document.getElementById("training-cadence-avg").innerHTML = data.eventData;
    }
    if (data.eventName === "training-stop") {
        document.getElementById("training-status").innerHTML = "Training gestoppt. :-)....*well done!*";
    }
}

async function setCounter() {
    // read the value from the input field
    var counter = document.getElementById("counterinput").value;

    // call the function
    var response = await axios.post(rootUrl + "/api/device/0/function/setCounter", { arg: counter });

    // Handle the response from the server
    alert("Response: " + response.data.result); // we could to something meaningful with the return value here ... 
}

async function getCounter() {
    // request the variable "counter"
    var response = await axios.get(rootUrl + "/api/device/0/variable/counter");
    var counter = response.data.result;

    // update the html element
    document.getElementById("counter").innerHTML = counter;
}

async function getLamp() {
    // request the variable "lamp"
    var response = await axios.get(rootUrl + "/api/device/0/variable/lamp");
    var lamp = response.data.result;

    // update the html element
    document.getElementById("lamp").innerHTML = lamp;
}

async function getMovementsInTraining() {
    // request the variable "movementsInTraining"
    var response = await axios.get(rootUrl + "/api/device/0/variable/HantelMovementsInTraining");
    var nrOfMovements = response.data.result;

    // update the html element
    document.getElementById("movementsInTraining").innerHTML = nrOfMovements;
}
