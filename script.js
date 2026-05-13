/* Navigation */
function openBlock(id){document.getElementById("dashboard").style.display="none";document.getElementById(id).style.display="block";

/* Fix Leaflet Map Rendering */

if(id === "mapBlock"){

setTimeout(() => {

map.invalidateSize();

}, 200);

}

}

function closeBlock(){
document.querySelectorAll(".expand").forEach(e=>e.style.display="none");
document.getElementById("dashboard").style.display="block";
}

/* Firebase */

const firebaseConfig={
apiKey:"AIzaSyBj4XZG64xFDE0-kcmqqr1Pw-_P6GYbWv8",
authDomain:"lora-hr04.firebaseapp.com",
databaseURL:"https://last-one-9cb4d-default-rtdb.asia-southeast1.firebasedatabase.app",
projectId:"lora-hr04"
};

firebase.initializeApp(firebaseConfig);

const ref=firebase.database().ref("loradata");

/* Graph Data */

let labels=[];
let waterValues=[];
let distanceValues=[];

/* Water Level Graph */

const chart=new Chart(document.getElementById("chart"),{

type:"line",

data:{
labels:labels,
datasets:[{
label:"Water Level (cm)",
data:waterValues,
borderColor:"blue",
borderWidth:2,
fill:false,
tension:0.3,
pointRadius:3,
pointHoverRadius:8
}]
},

options:{

responsive:true,

animation:false,

interaction:{
mode:'index',
intersect:false
},

plugins:{
tooltip:{
enabled:true,
callbacks:{
label:function(context){
return "Water Level: " +
context.parsed.y + " cm";
}
}
}
},

hover:{
mode:'nearest',
intersect:true
},

scales:{

y:{
min:0,
max:540,
title:{
display:true,
text:"Water Level (cm)"
}
},

x:{
title:{
display:true,
text:"Time"
}
}

}

}

});

/* Sensor Distance Graph */

const distanceChart=new Chart(
document.getElementById("distanceChart"),{

type:"line",

data:{
labels:labels,
datasets:[{
label:"Sensor Distance (cm)",
data:distanceValues,
borderColor:"red",
borderWidth:2,
fill:false,
tension:0.3,
pointRadius:3,
pointHoverRadius:8
}]
},

options:{

responsive:true,

animation:false,

interaction:{
mode:'index',
intersect:false
},

plugins:{
tooltip:{
enabled:true,
callbacks:{
label:function(context){
return "Sensor Distance: " +
context.parsed.y + " cm";
}
}
}
},

hover:{
mode:'nearest',
intersect:true
},

scales:{

y:{
min:0,
max:400,
title:{
display:true,
text:"Sensor Distance (cm)"
}
},

x:{
title:{
display:true,
text:"Time"
}
}

}

}

});

/* Maps */

var mapSmall=L.map('mapSmall').setView([13.715955, 79.594557],15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapSmall);

var map=L.map('map').setView([13.715955, 79.594557],15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

L.marker([13.715955, 79.594557]).addTo(map);

/* Table */

const table=document.getElementById("dataTable");

/* CSV Download */

function downloadCSV(){

let storedData =
JSON.parse(localStorage.getItem("waterLevelHistory"))
|| [];

let csv="Date,Time,WaterLevel(cm)\n";

storedData.forEach(item => {

csv +=
`${item.date},${item.time},${item.waterLevel}\n`;

});

const blob=new Blob([csv]);

const a=document.createElement("a");

a.href=URL.createObjectURL(blob);

a.download="water_level_history.csv";

a.click();

}

/* Firebase Listener */

ref.limitToLast(50).on("child_added",function(snapshot){

const data=snapshot.val();

let distance =
data?.uplink_message?.decoded_payload?.distance_cm ?? 0;

let waterLevel = 540 - distance;

if(waterLevel < 0){
waterLevel = 0;
}

let waterLevelMeter = (waterLevel / 100).toFixed(2);

let distanceMeter = (distance / 100).toFixed(2);

/* Update Main Card */

document.getElementById("waterLevelText").innerHTML =
"Water Level: " +
waterLevel + " cm (" +
waterLevelMeter + " m)";

document.getElementById("sensorDistanceText").innerHTML =
"Sensor Distance: " +
distance + " cm (" +
distanceMeter + " m)";

/* Expanded View */

document.getElementById("distanceLarge").innerHTML =
"Water Level: " +
waterLevel + " cm (" +
waterLevelMeter + " m)" +
"<br><br>" +
"Sensor Distance: " +
distance + " cm (" +
distanceMeter + " m)";

/* Status */

document.getElementById("deviceStatus").innerHTML =
"🟢 Online";

document.getElementById("lastUpdate").innerHTML =
new Date().toLocaleTimeString();

/* RSSI + SNR */

let rssi =
data?.uplink_message?.rx_metadata?.[0]?.rssi ?? "--";

let snr =
data?.uplink_message?.rx_metadata?.[0]?.snr ?? "--";

document.getElementById("rssiValue").innerHTML =
rssi + " dBm";

document.getElementById("snrValue").innerHTML =
snr + " dB";

/* Time */

const now = new Date();

const date = now.toLocaleDateString();

const time = now.toLocaleTimeString();

/* Update Graphs */

labels.push(time);

waterValues.push(waterLevel);

distanceValues.push(distance);

if(labels.length > 20){

labels.shift();
waterValues.shift();
distanceValues.shift();

}

chart.update();
distanceChart.update();

/* Table */

let row=table.insertRow(-1);

row.insertCell(0).innerHTML =
date + " " + time;

row.insertCell(1).innerHTML =
waterLevel + " cm";

/* Store History */

let history =
JSON.parse(localStorage.getItem("waterLevelHistory"))
|| [];

history.push({
date:date,
time:time,
waterLevel:waterLevel
});

const oneDayAgo = new Date();

oneDayAgo.setDate(oneDayAgo.getDate()-1);

history = history.filter(item => {

const itemDate =
new Date(item.date + " " + item.time);

return itemDate >= oneDayAgo;

});

localStorage.setItem(
"waterLevelHistory",
JSON.stringify(history)
);

});