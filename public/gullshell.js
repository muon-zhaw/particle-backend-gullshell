var rootUrl = window.location.origin; // get the root URL, e.g. https://example.herokuapp.com or http://localhost:3001
const NUMBER_OF_COLUMNS = 32;

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

function initialize(){
    getTimeout();
    getSignificantTemperatureDifference();
    getAlarmSystemStatus();
    getAlarmActiveStatus();    
    getSensitivity();
    //createHeatMap(NUMBER_OF_COLUMNS, getRandomOrEmptyTemperatureArray(true));
}
initialize()

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function createHeatMap(nrOfColumns, arr){
    var table = document.getElementById("my-heatmap");
    
    arr.forEach(function( element, index){        
        var rowIndex = Math.trunc(index / nrOfColumns);
        var colIndex = index % nrOfColumns;
        var row;
        var cell;
        // check if row exists already        
        if(table.rows.length-1 >= rowIndex){
            row = table.rows[rowIndex];
        } else {       
            row = table.insertRow(rowIndex);            
        }
        // check if cell exists already
        if(row.cells.length-1 >= colIndex){
            cell = row.cells[colIndex];
        } else {
            cell = row.insertCell(colIndex);
        }        
        //cell.innerHTML = element;
        cell.classList.value = ''
        cell.classList.add(getHeatLevelFromChar(element));
    });
    
}

function getHeatLevelFromChar(c){
    var className = "heatL01";
    switch (c) {
        case '&':
            className = "heatL10";
            break;
        case 'X':
            className = "heatL09";
            break;        
        case '#':
            className = "heatL08";
            break;
        case '%':
            className = "heatL07";
            break;
        case 'x':
            className = "heatL06";
            break;
        case '+':
            className = "heatL05";
            break;
        case '*':
            className = "heatL04";
            break;
        case '-':
            className = "heatL03";
            break;
        case '.':
            className = "heatL02";
            break;                                                                        
        default:
            className = "none";
          break;
      }
    return className;
}

function getRandomOrEmptyTemperatureArray(empty){
    var temperatures = [];
    temperatures.length = 768;
    if(empty == true){
        for (var i = 0; i < temperatures.length; i++) {
            temperatures[i] ='!';        
        }
    } else{
        for (var i = 0; i < temperatures.length; i++) {
            temperatures[i] =getRandomArbitrary(-20,400);        
        }
    }    
    return temperatures
}

function updateVariables(data) {
    // update the html elements
    document.getElementById("lastevent").innerHTML = JSON.stringify(data);
        
    if (data.eventName === "AlarmsystemActiveChanged") {
        document.getElementById("alarmsystem-status").innerHTML = data.eventData;

    }
    if (data.eventName === "AlarmStatusChanged") {
        document.getElementById("alarm-active").innerHTML = data.eventData;
        getAlarmActiveStatus(data);
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

async function setAlarmSystemState(status) {      
    // call the function
    if(status === 1){
        var response = await axios.post(rootUrl + "/api/device/0/function/setAlarmsystemOn", { arg: "null" });
    } else{
        var response = await axios.post(rootUrl + "/api/device/0/function/setAlarmsystemOff", { arg: "null" });
        getAlarmActiveStatus();
    }
    getAlarmSystemStatus();
    // Handle the response from the server
    //alert("Response: " + response.data.result); // we could to something meaningful with the return value here ... 
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

async function setSignificantTemperatureDifference() {
    // read the value from the input field
    var tempDifference = document.getElementById("significant-temp-diff-input").value;

    // call the function
    var response = await axios.post(rootUrl + "/api/device/0/function/setSignificantTemperatureDifference", { arg: tempDifference });

    getSignificantTemperatureDifference();
    // Handle the response from the server    
    //alert("Response: " + response.data.result); // we could to something meaningful with the return value here ... 
}


async function setSensitivity() {
    // read the value from the input field
    var sensitivity = document.getElementById("sensitivityRange").value;

    // call the function
    var response = await axios.post(rootUrl + "/api/device/0/function/setSensitivity", { arg: sensitivity });

    updateSensitivityValueTag(sensitivity);    
}

function updateSensitivityValueTag(sensitivity){    
    // update the html element
     document.getElementById("sensitivity-value").innerHTML = sensitivity;
}

function updateSensitivityValueSlider(sensitivity){    
    // update the html element
     document.getElementById("sensitivityRange").value = sensitivity;
}
async function setFlashLightState(status) {      
    // call the function
    if(status === 1){
        var response = await axios.post(rootUrl + "/api/device/0/function/setFlashLightOn", { arg: "null" });
    } else{
        var response = await axios.post(rootUrl + "/api/device/0/function/setFlashLightOff", { arg: "null" });
    }   
    // Handle the response from the server
    //alert("Response: " + response.data.result); // we could to something meaningful with the return value here ... 
}

async function setSoundState(status) {      
    // call the function
    if(status === 1){
        var response = await axios.post(rootUrl + "/api/device/0/function/setSoundOn", { arg: "null" });
    } else{
        var response = await axios.post(rootUrl + "/api/device/0/function/setSoundOff", { arg: "null" });
    }
    // Handle the response from the server
    //alert("Response: " + response.data.result); // we could to something meaningful with the return value here ... 
}

async function getTimeout() {
    // request the variable "timeout"
    var response = await axios.get(rootUrl + "/api/device/0/variable/timeout");
    var timeout = response.data.result;

    // update the html element
    document.getElementById("alarm-timeout").innerHTML = timeout + " s";
}

async function getSignificantTemperatureDifference() {
    // request the variable "significantTemperatureDifference"
    var response = await axios.get(rootUrl + "/api/device/0/variable/significantTemperatureDifference");
    var timeout = response.data.result;

    // update the html element
    document.getElementById("significant-temp-diff").innerHTML = timeout + " °C";
}

async function getSensitivity() {
    // request the variable "sensitivity"
    var response = await axios.get(rootUrl + "/api/device/0/variable/sensitivity");
    var sensitivity = response.data.result;

    // update the html element
    updateSensitivityValueTag(sensitivity);
    updateSensitivityValueSlider(sensitivity);
}


async function getAlarmSystemStatus() {
    // request the variable "isActiveAlarmSystem"
    var response = await axios.get(rootUrl + "/api/device/0/variable/isActiveAlarmSystem");
    var isActiveAlarmSystem = response.data.result;

    // update the html element
    document.getElementById("alarmsystem-status-variable").innerHTML = isActiveAlarmSystem;
    
    var att = document.createAttribute("checked");
    if(isActiveAlarmSystem){
        document.getElementById("set-alarmsystem-active").setAttributeNode(att);
    } else {
        document.getElementById("set-alarmsystem-inactive").setAttributeNode(att);
    }     
}

async function getAlarmActiveStatus(data) {
    // request the variable "isAlarmActive"
    var response = await axios.get(rootUrl + "/api/device/0/variable/isAlarmActive");
    var isAlarmActive = response.data.result;

    // update the html element
    document.getElementById("alarm-status-variable").innerHTML = isAlarmActive;    

    var alarmtext = document.getElementById("alarm-text");
    // show alarm
    if(isAlarmActive == true){
        alarmtext.innerHTML = "alarm active"
        alarmtext.classList.add("blinking");
        
    } else {
        alarmtext.innerHTML = "no alarm"
        alarmtext.classList.remove("blinking");        
        //createHeatMap(NUMBER_OF_COLUMNS, getRandomOrEmptyTemperatureArray(true));
    }

    var firstpart = await axios.get(rootUrl + "/api/device/0/variable/temperatureCharactersString1");        
    var secondpart = await axios.get(rootUrl + "/api/device/0/variable/temperatureCharactersString2");  
    temperatures = parseTempStringToArray(firstpart.data.result, secondpart.data.result);        
    createHeatMap(NUMBER_OF_COLUMNS, temperatures);
}

function parseTempStringToArray(temperaturesString1, temperaturesString2){
    //JSON.parse(temperaturesString)
    var temperatures = [];
    temperatures.length = temperaturesString1.length + temperaturesString2.length;
    for (var i = 0; i < temperaturesString1.length; i++) {
        temperatures[i] = temperaturesString1.charAt(i);
    }
    for (var i = 0; i < temperaturesString2.length; i++) {
        temperatures[i+temperaturesString1.length] = temperaturesString2.charAt(i);
    }
    return temperatures;
}


//////////////////////////////////
/////   Code für das Chart   /////
//////////////////////////////////
// Array, in dem alle empfangenen Lux-Werte gespeichert werden.
var allMeasurements = [];

// Maximaler Lux Level für die Berechnung des Prozentwerts und als maximaler Wert für das Chart.
// -- TODO Aufgabe 1 -- 
// Maximalwert anpassen 
// 20'000 Lux entspricht klarem Himmel im Winter Mitteleuropa zur Mittagszeit
// 6'000 Lux bedeckter Himmel, Sonnenhöhe 16° (mittags im Winter)
// 3'000 Lux Bedeckter Wintertag
// 1'400 Fußballstadion Kategorie 4
// 750 Lux Dämmerung (Sonne knapp unter Horizont)
// 500 lux Büro-/Zimmerbeleuchtung
// 3 Lux Dämmerung (Sonne 6° unter Horizont
//
var maxLevel = 20000;
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
