// Global Variables
let countryNames = [];
let countryISO = [];
let listHTML, currentLat, currentLng, currentCountry, userCountryName, userCountry;

// Setup the map
const map = L.map('geoMap').setView([51.505, -0.09], 6);

var geoWorldMap = L.tileLayer('https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?&apiKey=63630b23ded941c08ad75ae54eb01087', {
  attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> contributors',
  maxZoom: 20, id: 'osm-bright'
}).addTo(map);

// -------------------------------- Country Object Definition --------------------------------

function Country(name, iso_a2, iso_a3, iso_n3, geoType, coordinates){
    this.name = name;
    this.iso_a2 = iso_a2;
    this.iso_a3 = iso_a3;
    this.iso_n3 = iso_n3;
    this.coordinates = coordinates;
    this.geoType = geoType;
    this.lat;
    this.lng;
    
    // Modal 1 - Country Info
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
    
    // Modal 3 - Weather - ([Temp] [FeelsLike] [Weather] [WeatherIcon])
    this.weather_current = [];
    this.weather_tomorrow = []; 
    this.weather_2days = []; 
    this.weather_3days = []; 
    this.weather_4days = []; 
    
    // Modal 4 - News Articles - ([Image] [Title] [URL] [Source] [Published])
    this.news_article1 = [];
    this.news_article2 = [];
    this.news_article3 = [];

}

// Main AJAX & jQuery Code
$(document).ready(() => {

    // Get the country information
    $.ajax({
        type: 'GET',
        url: "./libs/js/json/countryBorders.geo.json",
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

        
            // ---------------- Find The Users Location And Set Map ----------------
           
            function geoSuccess(position) {
                currentLat = position.coords.latitude;
                currentLng = position.coords.longitude;
                getCurrentCountry(currentLat, currentLng);

                // ---------------- Welcome Alert Message ----------------
                // setTimeout(function(){    
                //     Swal.fire({
                //         title: 'Welcome to Gazetteer!',
                //         html: `<br>Select a country from the list and click any of the map icons to get started. <br><br>
                        
                //         <i>We see that you are visiting us from <b>${currentCountry.name}</b>. We've left the map here for you...</i>`,
                //         confirmButtonText: 'OK',
                //         background: '#D3D3D3'
                //     })

                // }, 3000); 
            }
              
            // function geoError(err) { 
                
            //     Swal.fire({
            //         title: 'Welcome to Gazetteer!',
            //         html: `<br>Select a country from the list and click any of the map icons to get started. <br><br>
            //         <i>Unfortunately your location could not be determined... Defaulting your location to <b>United Kingdom</b>.</i>`,
            //         confirmButtonText: 'OK',
            //         background: '#D3D3D3'
            //     });

            //     getCurrentCountry(54,-2);

            // }
              
            // navigator.geolocation.getCurrentPosition(geoSuccess, geoError);

        }
        
    });


    // ---------------- Behaviour for New County Selection ----------------
    $('#country').change(() => {
        
        var e = document.getElementById("country");
        var value = e.options[e.selectedIndex].value;// get selected option value
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

// -------------------------------- Get Country Info --------------------------------
function getAllInfo(country){

    // Country Info
    getCountryInfo(country);

    // Get Exchange Rate
    getExchangeRate(country);

    // Weather
    getWeatherInfo(country);

    // Timezone
    getTimezone(country);

    // REST Countries
    getRESTCountryInfo(country);

    // Top Country News
    getNews(country);


}

// -------------------------------- Get User Current Country Info From GeoNames --------------------------------

async function getCurrentCountry(lat,lng){

    // API Call to get users country info
    await $.ajax({
        url: "./libs/php/currentCountry.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: lat,
            lng: lng,
        },
        success: function(result) {
			
			// console.log(result);

            // console.log(JSON.stringify(result));

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

// -------------------------------- Get Country Info from GeoNames --------------------------------
    
function getCountryInfo(country){

    $.ajax({
        url: "./libs/php/countryInfo.php",
        type: 'GET',
        dataType: 'json',
        data: {
            country: country.iso_a2,
        },
        success: function(result) {

            if (result.status.name == "ok") {
                
                country.area = result['data']['geonames']['0']['areaInSqKm'];
                country.capitalCity = result['data']['geonames']['0']['capital'];
                country.continent = result['data']['geonames']['0']['continentName'];
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

// -------------------------------- Get Exchange Rate from Open Exchange Rate  --------------------------------
    
function getExchangeRate(country){
    $.ajax({
        url: "./libs/php/exchangeRate.php",
        type: 'GET',
        dataType: 'json',
        data: {},
        success: function(result) {

            if (result.status.name == "ok") {
                country.exchangeRate = result['data']['rates'][country.currencyCode];
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(jqXHR));
            console.log(JSON.stringify(textStatus));
            console.log(JSON.stringify(errorThrown));
        }
    }); 
}

// -------------------------------- Get Weather Info From OpenWeather  --------------------------------
    
function getWeatherInfo(country){
    $.ajax({
        url: "./libs/php/openWeather.php",
        type: 'GET',
        dataType: 'json',
        data: {
            lat: country.lat,
            lng: country.lng,
        },
        success: function(result) {

            
            // console.log(JSON.stringify(result));
                        
            if (result.status.name == "ok") {

                country.weather_current.push(result['data']['current']['temp'] - 273.15,result['data']['current']['feels_like'] - 273.15,result['data']['current']['weather']['0']['main'],result['data']['current']['weather']['0']['icon']);

                country.weather_tomorrow.push(result['data']['daily']['0']['temp']['day'] - 273.15, result['data']['daily']['0']['feels_like']['day'] - 273.15,result['data']['daily']['0']['weather']['0']['main'],result['data']['daily']['0']['weather']['0']['icon']);

                country.weather_2days.push(result['data']['daily']['1']['temp']['day'] - 273.15, result['data']['daily']['1']['feels_like']['day'] - 273.15,result['data']['daily']['1']['weather']['0']['main'],result['data']['daily']['1']['weather']['0']['icon']);

            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(jqXHR));
            console.log(JSON.stringify(textStatus));
            console.log(JSON.stringify(errorThrown));
        }
    }); 
}

// -------------------------------- Get Timezone from GeoNames --------------------------------
    
function getTimezone(country){

    $.ajax({
        url: "./libs/php/timezone.php",
        type: 'GET',
        dataType: 'json',
        data: {
            lat: country.lat,
            lng: country.lng,
        },
        success: function(result) {

            if (result.status.name == "ok") {
                country.timezone = result['data']['timezoneId'];
                country.timeOffset = result['data']['dstOffset'];
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(jqXHR));
            console.log(JSON.stringify(textStatus));
            console.log(JSON.stringify(errorThrown));
        }
    }); 
};

// -------------------------------- Get REST Country Info  --------------------------------
    
function getRESTCountryInfo(country){
	
	// console.log(country);
	
    $.ajax({
        url: "./libs/php/restcountries.php",
        type: 'GET',
        dataType: 'json',
        data: {
            alpha3: country.iso_a3,
        },
        success: function(result) {
			

            if (result.status.name == "ok") {
                country.flag = result['data']['0']['flags']['png'];
				// Language array keys not known - 3 letters. 
                // Used method from StackOverflow to access first key - https://stackoverflow.com/questions/3298477/get-the-first-key-name-of-a-javascript-object
                country.languages = result['data']['0']['languages'][Object.keys(result['data']['0']['languages'])[0]];
                country.currencyCode = result['data']['0']['currencies']['code'];
                country.currencyName = result['data']['0']['currencies']['name'];
                country.currencySymbol = result['data']['0']['currencies']['symbol'];
                country.topLevelDomain = result['data']['0']['topLevelDomain'];
                country.callingCode = result['data']['0']['callingCodes'];
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(jqXHR));
            console.log(JSON.stringify(textStatus));
            console.log(JSON.stringify(errorThrown));
        }
    }); 
};



// -------------------------------- Get News From NewsAPI  --------------------------------
    
function getNews(country){
    $.ajax({
        url: "./libs/php/newsApi.php",
        type: 'GET',
        dataType: 'json',
        data: {
            country: country.iso_a2,
        },
        success: function(result) {
            console.log(result);
            
                        
            if (result.status.name == "ok") {

                // Modal 4 - News Articles - ([Image] [Title] [URL] [Source] [Published])
                country.news_article1.push(result['data']['articles']['0']['title'], result['data']['articles']['0']['url'], result['data']['articles']['0']['source']['Name'], result['data']['articles']['0']['publishedAt']);

                country.news_article2.push(result['data']['articles']['1']['title'], result['data']['articles']['1']['url'], result['data']['articles']['1']['source']['Name'], result['data']['articles']['1']['publishedAt']);
                
                country.news_article3.push(result['data']['articles']['2']['title'], result['data']['articles']['2']['url'], result['data']['articles']['2']['source']['Name'], result['data']['articles']['2']['publishedAt']);

            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(jqXHR));
            console.log(JSON.stringify(textStatus));
            console.log(JSON.stringify(errorThrown));
        }
    }); 
}




// -------------------------------- Add Country average lat and long values --------------------------------
function findAvgLatLng(country){

    // Call to JSON file
    $.ajax({
        type: 'GET',
        url: "./libs/js/json/countryInfo.json",
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
};

// -------------------------------- Button 1 - Country Information --------------------------------

L.easyButton({
    position: 'topleft',
    id: 'countryBtn',
    states: [{
        icon: 'fa-folder',
        stateName: 'unchecked',
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
            document.getElementById('countryInfoTimezone').innerHTML = currentCountry.timezone;
            document.getElementById('countryInfoPopulation').innerHTML = `${(currentCountry.population / 1000000).toFixed(1)} M`;
            document.getElementById('countryInfoArea').innerHTML = `${Math.floor(currentCountry.area)}`;
            document.getElementById('countryInfoLanguage').innerHTML = currentCountry.languages;

        }
    }, {
        icon: '&#x238C;',
        stateName: 'checked',
        onClick: function(btn,map) {
            btn.state('unchecked');
        }
    }]
}).addTo(map);


// -------------------------------- Button 2 - Currency Information --------------------------------

L.easyButton({
    position: 'topleft',
    id: 'currencyBtn',
    states: [{
        icon: "fa-coins",
        stateName: 'unchecked',
        title: 'Show Currency Information',
        onClick: function(btn,map) {

            $("#currencyInfoModal").modal("show");

            $(".close").click(function(){
                $("#currencyInfoModal").modal('hide');
            });

            document.getElementById('currencyInfoCurrencyCode').innerHTML = `${currentCountry.currencyCode} (${currentCountry.currencySymbol})`;
            document.getElementById('currencyInfoCurrencyName').innerHTML = currentCountry.currencyName;
            document.getElementById('currencyInfoExchange').innerHTML = `${(currentCountry.exchangeRate)}`;
            document.getElementById('currencyInfoTLD').innerHTML = currentCountry.topLevelDomain;
            document.getElementById('currencyInfoCalling').innerHTML = `+${currentCountry.callingCode}`;

        }
    }, {
        icon: '&#x238C;',
        stateName: 'checked',
        onClick: function(btn,map) {
            btn.state('unchecked');
        }
    }]
}).addTo(map);

// -------------------------------- Button 3 - Weather --------------------------------

L.easyButton({

    id: 'weatherBtn',
    states: [{
        icon: "fa-sun",
        stateName: 'unchecked',
        title: 'Show Weather Forecast (3 Day)',
        onClick: function(btn,map) {
            
            // Calculate the upcoming days
            const d = new Date();
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var twoDays = d.getDay() + 2;

            if(twoDays > 6){
                twoDays -=7;
            } 

            twoDays = days[twoDays], 

            $("#weatherModal").modal("show");

            $(".close").click(function(){
                $("#weatherModal").modal('hide');
            });

            document.getElementById('Modal2Title').innerHTML = `3 Day Weather Forecast for ${currentCountry.name}`
            document.getElementById('currentIcon').src = `http://openweathermap.org/img/w/${currentCountry.weather_current[3]}.png`
            document.getElementById('currentTemp').innerHTML = `${Math.floor(currentCountry.weather_current[0])}°C`;
            document.getElementById('currentFeelsLike').innerHTML = `${Math.floor(currentCountry.weather_current[1])}°C`;
            document.getElementById('currentConditions').innerHTML = currentCountry.weather_current[2];
            document.getElementById('tomorrowIcon').src = `http://openweathermap.org/img/w/${currentCountry.weather_tomorrow[3]}.png`
            document.getElementById('tomorrowTemp').innerHTML = `${Math.floor(currentCountry.weather_tomorrow[0])}°C`;
            document.getElementById('tomorrowFeelsLike').innerHTML = `${Math.floor(currentCountry.weather_tomorrow[1])}°C`;
            document.getElementById('tomorrowConditions').innerHTML = currentCountry.weather_tomorrow[2];
            document.getElementById('2DayName').innerHTML = twoDays;
            document.getElementById('2dayIcon').src = `http://openweathermap.org/img/w/${currentCountry.weather_2days[3]}.png`
            document.getElementById('2dayTemp').innerHTML = `${Math.floor(currentCountry.weather_2days[0])}°C`;
            document.getElementById('2dayFeelsLike').innerHTML = `${Math.floor(currentCountry.weather_2days[1])}°C`;
            document.getElementById('2dayConditions').innerHTML = currentCountry.weather_2days[2];
            
        }
    }, {
        icon: '&#x238C;',
        stateName: 'checked',
        onClick: function(btn,map) {
            btn.state('unchecked');
        }
    }]


}).addTo(map);




// -------------------------------- Button 4 - Country News --------------------------------

L.easyButton({

    id: 'newsBtn',
    states: [{
        icon: "fa-newspaper",
        stateName: 'unchecked',
        title: 'Latest Country News',
        onClick: function(btn,map) {
            if(currentCountry.news_article1[0]){

                $("#newsModal").modal("show");

                $(".close").click(function(){
                    $("#newsModal").modal('hide');
                });
                
                document.getElementById('Modal4Title').innerHTML = `Latest Top News Stories for ${currentCountry.name}`;
                document.getElementById('article1Link').href = currentCountry.news_article1[1];
                document.getElementById('article1Title').innerHTML = currentCountry.news_article1[0];
                document.getElementById('article1Source').innerHTML = `<em>Source: ${currentCountry.news_article2[2]}</em>`;
                document.getElementById('article2Link').href = currentCountry.news_article2[1];
                document.getElementById('article2Title').innerHTML = currentCountry.news_article2[0];
                document.getElementById('article2Source').innerHTML = `<em>Source: ${currentCountry.news_article2[2]}</em>`;
                document.getElementById('article3Link').href = currentCountry.news_article3[1];
                document.getElementById('article3Title').innerHTML = currentCountry.news_article3[0];
                document.getElementById('article3Source').innerHTML = `<em>Source: ${currentCountry.news_article3[2]}</em>`;

            } else {
                $("#newsError").modal("show");

                $(".close").click(function(){
                    $("#newsError").modal('hide');
                });

                document.getElementById('errorCountry').innerHTML = currentCountry.name;               

            }
        }
    }, {
        icon: '&#x238C;',
        stateName: 'checked',
        onClick: function(btn,map) {
            btn.state('unchecked');
        }
    }]


}).addTo(map);

// var markerClusters = L.markerClusterGroup();

var MapIcon = L.Icon.extend({
    options: {
        iconSize:     [30, 30],
        popupAnchor:  [0, -20]
    }
});

// -------------------------------- Update Country Border --------------------------------
function updateMap(type, coordinates, borderChange){

    // markerClusters = L.markerClusterGroup();
    
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


//--------------------------------------------------
// Get users location

$( document ).ready(function() {

    if ("geolocation" in navigator){ //check geolocation available 
    //try to get user current location using getCurrentPosition() method
        navigator.geolocation.getCurrentPosition(function(position){
                
            var currentCountry = getCurrentCountry(position.coords.latitude, position.coords.longitude);
             
            console.log("Found your location Lat : "+position.coords.latitude+" Lang :"+ position.coords.longitude);
        });
        
        
        
    } else{
        console.log("Browser doesn't support geolocation!");
    }

});