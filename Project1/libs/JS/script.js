// Leaflet

const map = L.map('geoMap').setView([51.505, -0.09], 6);

L.tileLayer('https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?&apiKey=63630b23ded941c08ad75ae54eb01087', {
  attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> contributors',
  maxZoom: 20, id: 'osm-bright'
}).addTo(map);


// Main AJAX & jQuery Code
$(document).ready(function(){
    
    $.getJSON("countryBorders.geo.json", function(data){
        console.log(data)
    })
    
    
})
    