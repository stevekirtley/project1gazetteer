let countryNames = [];
let listHTML, currentLat, currentLng, currentCountry, userCountryName, userCountry;

// Leaflet

const map = L.map('geoMap').setView([51.505, -0.09], 6);

var geoWorldMap = L.tileLayer('https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?&apiKey=63630b23ded941c08ad75ae54eb01087', {
  attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> contributors',
  maxZoom: 20, id: 'osm-bright'
}).addTo(map);

function Country(name, iso_a2, iso_a3, iso_n3, geoType, coordinates){
    this.name = name;
    this.iso_a2 = iso_a2;
    this.iso_a3 = iso_a3;
    this.iso_n3 = iso_n3;
    this.coordinates = coordinates;
    this.geoType = geoType;
    this.lat;
    this.lng;

    // Country Info Modal
    this.flag;
    this.capitalCity;
    this.timezone;
    this.timeOffset;
    this.population;
    this.area;
    this.languages;
    this.currencyCode;
    this.currencyName;
    this.currencySymbol;
    this.exchangeRate;
    this.topLevelDomain;
    this.callingCode;
}

function findAvgLatLng(country){

    // Call to JSON file
    $.ajax({
        type: 'GET',
        url: "./libs/JS/JSON/countryInfo.json",
        data: {},
        dataType: 'json',
        success: function(data) {

            let alpha2 = country.iso_a2;

            for(let i=0; i < data.length; i++){
                
                let jsonalpha2 = data[i]['Alpha-2 code'];
                let latAvg = data[i]['Latitude'];
                let lngAvg = data[i]['Longitude'];

                if (alpha2 == jsonalpha2){
                    country.lat = latAvg; 
                    country.lng = lngAvg;
                } 
            }
        }
    })
}

// Main AJAX & jQuery Code
$(document).ready(() => {

    $.ajax({
        type: 'GET',
        url: "./libs/JS/JSON/countryBorders.geo.json",
        data: {},
        dataType: 'json',
        success: function(data) {

            // ---------------- Generate Country Objects ----------------
            const results = data["features"]      
            for(let i=0; i < results.length; i++){
                
                let name = results[i]['properties']['name'];
                let iso_a2 = results[i]['properties']['iso_a2'];
                let iso_a3 = results[i]['properties']['iso_a3'];
                let iso_n3 = results[i]['properties']['iso_n3'];
                let geoType = results[i]['geometry']['type'];
                let coordinates = results[i]['geometry']['coordinates'];;

                countryNames.push([name, iso_a2]);

                noSpaceName = name.replace(/\s+/g, '');
                window[noSpaceName] = new Country(name, iso_a2, iso_a3, iso_n3, geoType, coordinates)
                findAvgLatLng(window[noSpaceName]);

            }
        
             // ---------------- Generate The Country List ----------------
             listHTML += `<option value="Select..." selected>Select...</option>`;
             countryNames.sort();
             for(i=0; i < countryNames.length; i++){
                     listHTML += `<option value="${countryNames[i][1]}">${countryNames[i][0]}</option>`
             }
             $('#country').html(listHTML);

             function geoSuccess(position) {
                currentLat = position.coords.latitude;
                currentLng = position.coords.longitude;
                getCurrentCountry(currentLat, currentLng);
             }}
            

                // ---------------- Welcome Alert Message ----------------
                

        
    

        



        $('#country').change(() => {
        
    
            var e = document.getElementById("country");
            // var value = e.options[e.selectedIndex].value;// get selected option value
            var selectedCountry = e.options[e.selectedIndex].text;
    
            var countryNoSpaces = selectedCountry.replace(/\s+/g, '');
            currentCountry = window[countryNoSpaces];
    
            updateMap(currentCountry.geoType, currentCountry.coordinates, true);
    
            getAllInfo(currentCountry)
    
            setTimeout(function(){    
                $('#capital').click();
                $('#cities').click();
            }, 2000); 
    
        
        })
    
    });

    // function getAllInfo(country) {
    //     getCountryInfo(country);

    //     getRESTCountriesInfo(country);
    // }


    // Geonames Timezone
async function getCurrentCountry(lat,lng){

    // API Call to GeoNames to get users country info
    await $.ajax({
        url: "libs/php/timezone.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: lat,
            lng: lng,
        },
        success: function(result) {

            //console.log(JSON.stringify(result));

            if (result.status.name == "ok") {
                userCountryName = result['data']['countryName'];
                var userCountrySpaces = userCountryName 
                var userCountryNoSpaces = userCountrySpaces.replace(/\s+/g, '');
                currentCountry = window[userCountryNoSpaces];
                
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(jqXHR));
            console.log(JSON.stringify(textStatus));
            console.log(JSON.stringify(errorThrown));
        }
    }); 

    updateMap(currentCountry.geoType, currentCountry.coordinates, false); 

    $('#country').val(currentCountry.iso_a2).change();


    // ---------------- Stop the PreLoader ----------------
    $('#preloader').fadeOut(function(){
        $(this).remove();
    });
    
}


// Country Info API

function getCountryInfo(country){

    $.ajax({
        url: "./libs/PHP/countryInfo.php",
        type: 'GET',
        dataType: 'json',
        data: {
            country: country.iso_a2,
        },
        success: function(result) {
            

            if (result.status.name == "ok") {
                
                console.log(result);
                country.area = result['data']['geonames']['0']['areaInSqKm'];
                country.capitalCity = result['data']['geonames']['0']['capital'];
                country.currencyCode = result['data']['geonames']['0']['currencyCode'];
                country.languages = result['data']['geonames']['0']['languages'];
                country.population = result['data']['geonames']['0']['population'];  
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(jqXHR));
            console.log(JSON.stringify(textStatus));
            console.log(JSON.stringify(errorThrown));
        }
    }); 
};

function getRESTCountriesInfo(country){

    $.ajax({
        url: "./libs/php/restcountries.php",
        type: 'GET',
        dataType: 'json',
        data: {
            alpha3: country.iso_a3,
        },
        success: function(result) {

            if (result.status.name == "ok") {
                country.flag = result['data']['flag'];
                // country.languages = result['data']['languages']['0']['name'];
                // country.currencyCode = result['data']['currencies']['0']['code'];
                // country.currencyName = result['data']['currencies']['0']['name'];
                // country.currencySymbol = result['data']['currencies']['0']['symbol'];
                // country.topLevelDomain = result['data']['topLevelDomain']['0'];
                // country.callingCode = result['data']['callingCodes'];
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(jqXHR));
            console.log(JSON.stringify(textStatus));
            console.log(JSON.stringify(errorThrown));
        }
    }); 
};





L.easyButton({
    position: 'topleft',
    id: 'countryBtn',
    states: [{
        icon: "fa-info",
        // stateName: 'unchecked',
        title: 'Show Country Information',
        onClick: function(btn,map) {

            $("#countryInfoModal").modal("show");

            $(".close").click(function(){
                $("#countryInfoModal").modal('hide');
            });

            document.getElementById('Modal1Title').innerHTML = `${currentCountry.name} Information`
            document.getElementById('countryFlag').src = currentCountry.flag;
            document.getElementById('countryInfoName').innerHTML = currentCountry.name;
            document.getElementById('countryInfoCapital').innerHTML = currentCountry.capitalCity;
            // document.getElementById('countryInfoPopulation').innerHTML = `${(currentCountry.population / 1000000).toFixed(1)} M`;
            // document.getElementById('countryInfoArea').innerHTML = `${Math.floor(currentCountry.area)}`;
            document.getElementById('countryInfoLanguage').innerHTML = currentCountry.languages;
            // document.getElementById('countryInfoCurrencyCode').innerHTML = `${currentCountry.currencyCode} (${currentCountry.currencySymbol})`;
            // document.getElementById('countryInfoCurrencyName').innerHTML = currentCountry.currencyName;
            // document.getElementById('countryInfoExchange').innerHTML = `${(currentCountry.exchangeRate).toFixed(2)}`;
            // document.getElementById('countryInfoTLD').innerHTML = currentCountry.topLevelDomain;
            // document.getElementById('countryInfoCalling').innerHTML = `+${currentCountry.callingCode}`;
            console.log(currentCountry);
            console.log(country.languages);

        }
    }, {
        icon: '&#x238C;',
        stateName: 'checked',
        onClick: function(btn,map) {
            btn.state('unchecked');
        }
    }]
}).addTo(map);



function updateMap(type, coordinates, borderChange){

        
    map.eachLayer(function (layer) {
        if(layer != geoWorldMap){
            map.removeLayer(layer);
        }
    });

    border = new L.geoJSON({
        "type": type,
        "coordinates": coordinates
    },{
        style: {
            color: "brown"
        }
    }).addTo(map);

    map.fitBounds(border.getBounds());
}