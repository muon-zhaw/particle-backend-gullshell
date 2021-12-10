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
        
    if (data.eventName === "AlarmsystemActiveChanged") {
        document.getElementById("alarmsystem-status").innerHTML = data.eventData;
    }
    if (data.eventName === "AlarmStatusChanged") {
        document.getElementById("alarm-active").innerHTML = data.eventData;
    }
    
    //if (data.eventName === "training-stop") {
    //    document.getElementById("training-status").innerHTML = "Training gestoppt. :-)....*well done!*";
    //}
    
    if (data.eventName === "Lux") {
        // Erhaltenen Wert in der Variable 'lux' speichern
        var lux = Number(data.eventData);
        //console.log(lux);

        // Wert am Ende des Arrays 'allMeasurements' hinzufügen
        allMeasurements.push(lux);

        // Wert in Prozent umrechnen und in 'level' speichern
        var level = lux * (100 / maxLevel);

        // Farbe des Balkens abhängig von Level festlegen
        // Liste aller unterstützten Farben: https://www.w3schools.com/cssref/css_colors.asp
        // -- TODO Aufgabe 2 -- 
        // Weitere Farben abhängig vom Level
        if (level < 4) {
            color = "Black";
        } else if (level < 30) {
            color = "Blue";
        } else {
            color = "Yellow";
        }

        // CSS Style für die Hintergrundfarbe des Balkens
        var colorStyle = "background-color: " + color + " !important;";

        // CSS Style für die Breite des Balkens in Prozent
        var widthStyle = "width: " + level + "%;"

        // Oben definierte Styles für Hintergrundfarbe und Breite des Balkens verwenden, um
        // den Progressbar im HTML-Dokument zu aktualisieren
        document.getElementById("luxlevel-bar").style = colorStyle + widthStyle;

        // Text unterhalb des Balkens aktualisieren
        document.getElementById("luxlevel-text").innerHTML = lux + " Lux"

        // Durchschnitt aller bisherigen Messungen berechnen und in 'luxAverage' speichern
        var luxSum = 0;
        for (var measurement of allMeasurements) {
            luxSum = luxSum + measurement;
        }
        var luxAverage = luxSum / allMeasurements.length;
        //console.log(luxAverage);

        // -- TODO Aufgabe 3 -- 
        // Durchschnittlichen Lux-Wert (luxAverage) in Prozent umrechnen und als Balken und Text anzeigen
        
        // Wert in Prozent umrechnen und in 'averageLevel' speichern
        var averageLevel = luxAverage * (100 / maxLevel);
        
        var colorAverageProgressBar = "#F4A460";
        var widthInPercent = averageLevel;

         // CSS Style für die Hintergrundfarbe des Balkens
         var colorStyle = "background-color: " + colorAverageProgressBar + " !important;";

         // CSS Style für die Breite des Balkens in Prozent
         var widthStyle = "width: " + widthInPercent + "%;"
 

        // Oben definierte Styles für Hintergrundfarbe und Breite des Balkens verwenden, um
        // den Progressbar im HTML-Dokument zu aktualisieren
        //document.getElementById("average-luxlevel-bar").style.backgroundColor = colorAverageProgressBar + " !important;";
        //document.getElementById("average-luxlevel-bar").style.width = widthInPercent;
        document.getElementById("average-luxlevel-bar").style = colorStyle + widthStyle;

        document.getElementById("average-luxlevel-text").innerHTML = luxAverage + " Lux";


        // Wert im Chart hinzufügen
        addData(lux);
    }
}

async function setAlarmTimeout() {
    // read the value from the input field
    var timeout = document.getElementById("timeoutinput").value;

    // call the function
    var response = await axios.post(rootUrl + "/api/device/0/function/setTimeout", { arg: timeout });

    getTimeout();
    // Handle the response from the server    
    //alert("Response: " + response.data.result); // we could to something meaningful with the return value here ... 
}

async function setAlarmSystemState(status) {      
    // call the function
    if(status === 1){
        var response = await axios.post(rootUrl + "/api/device/0/function/setAlarsystemOn", { arg: "null" });
    } else{
        var response = await axios.post(rootUrl + "/api/device/0/function/setAlarsystemOff", { arg: "null" });
    }
    getAlarmSystemStatus();
    // Handle the response from the server
    //alert("Response: " + response.data.result); // we could to something meaningful with the return value here ... 
}

async function getTimeout() {
    // request the variable "timeout"
    var response = await axios.get(rootUrl + "/api/device/0/variable/timeout");
    var timeout = response.data.result;

    // update the html element
    document.getElementById("alarm-timeout").innerHTML = timeout;
}

async function getAlarmSystemStatus() {
    // request the variable "isActiveAlarmSystem"
    var response = await axios.get(rootUrl + "/api/device/0/variable/isActiveAlarmSystem");
    var isActiveAlarmSystem = response.data.result;

    // update the html element
    document.getElementById("alarmsystem-status-variable").innerHTML = isActiveAlarmSystem;
}

async function getAlarmActiveStatus() {
    // request the variable "isAlarmActive"
    var response = await axios.get(rootUrl + "/api/device/0/variable/isAlarmActive");
    var isAlarmActive = response.data.result;

    // update the html element
    document.getElementById("alarm-status-variable").innerHTML = isAlarmActive;
}


//////////////////////////////////
/////   Code für das Chart   /////
//////////////////////////////////

// Line Chart Dokumentation: https://developers.google.com/chart/interactive/docs/gallery/linechart

// Chart und Variablen 
var chartData, chartOptions, chart;
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

// Chart initialisieren. Diese Funktion wird einmalig aufgerufen, wenn die Page geladen wurde.
function drawChart() {
    // Daten mit dem Dummy-Wert ["", 0] initialisieren. 
    // (Dieser Dummy-Wert ist nötig, damit wir das Chart schon anzeigen können, bevor 
    // wir Daten erhalten. Es können keine Charts ohne Daten gezeichnet werden.)
    chartData = google.visualization.arrayToDataTable([['Time', 'Lux'], ["", 0]]);
    // Chart Options festlegen
    chartOptions = {
        title: 'Lux Level',
        hAxis: { title: 'Time' },
        vAxis: { title: 'Lux' },
        animation: {
            duration: 300, // Dauer der Animation in Millisekunden
            easing: 'out',
        },
        curveType: 'function', // Werte als Kurve darstellen (statt mit Strichen verbundene Punkte)
        legend: 'none',
        vAxis: {
            // Range der vertikalen Achse
            viewWindow: {
                min: 0,
                max: maxLevel
            },
        }
    };
    // LineChart initialisieren
    chart = new google.visualization.LineChart(document.getElementById('luxlevel-chart'));
    chartData.removeRow(0); // Workaround: ersten (Dummy-)Wert löschen, bevor das Chart zum ersten mal gezeichnet wird.
    chart.draw(chartData, chartOptions); // Chart zeichnen
}

// Eine neuen Wert ins Chart hinzufügen
function addData(lux) {

    // -- TODO Aufgabe 4 --
    // Nur die letzten 10 gemessenen Werte anzeigen.
    // Tipp: mit chartData.removeRow(0) kann der erste Eintrag im Chart entfernt werden.
    if(allMeasurements.length > 10){
        chartData.removeRow(0);
    }

    // aktuelles Datum/Zeit
    var date = new Date();
    // aktuelle Zeit in der Variable 'localTime' speichern
    var localTime = date.toLocaleTimeString();

    // neuen Wert zu den Chartdaten hinzufügen
    chartData.addRow([localTime, lux]);

    // Chart neu rendern
    chart.draw(chartData, chartOptions);
}
