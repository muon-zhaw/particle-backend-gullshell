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
    if (data.eventName === "alarmsystemActiveChanged") {
        document.getElementById("alarmsystemEvent").innerHTML = data.eventData;
    }
}

async function setAlarmTimeout() {
    // read the value from the input field
    var timeout = document.getElementById("timeoutinput").value;

    // call the function
    var response = await axios.post(rootUrl + "/api/device/0/function/setTimeout", { arg: timeout });

    // Handle the response from the server
    alert("Response: " + response.data.result); // we could to something meaningful with the return value here ... 
}

async function getAlarmSystemStatus() {
    // request the variable "isActiveAlarmSystem"
    var response = await axios.get(rootUrl + "/api/device/0/variable/isActiveAlarmSystem");
    var isActiveAlarmSystem = response.data.result;

    // update the html element
    document.getElementById("counter").innerHTML = isActiveAlarmSystem;
}
