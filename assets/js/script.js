

function makeLowerCase(str){
    return str.toLowerCase();
}

function getWeatherDataNormal(city, state, country) {
    city = makeLowerCase(city);
    city[0] = city[0].toUpperCase();
    state = makeLowerCase(city);
    country = makeLowerCase(city);
    
    var apiUrl;
    if(!country){
        if(!state){
            apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=1dbf052af59023935e40459b0107bc1a";
        }
        else{
            apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + state +"&appid=1dbf052af59023935e40459b0107bc1a";
        }
    }
    else{
        apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + state + "," + country +"&appid=1dbf052af59023935e40459b0107bc1a";
    }

    fetch(apiUrl).then(response => {
        if(response.ok){
            return response.json();
        }
    })
    then(data => {
        console.log(data);
    })
}

function getWeatherDataZip(zip, country) {
    
}

function getWeatherDataCityId(cityId) {
    
}

function getWeatherDataCoordinates(lat, lon) {
    
}

$(document).ready(function () {
    $("#form-container").on("submit", function() {
        var location = $("#form-container").find("input").val().trim();
        var locationParameters = location.split(",");
        for (let i = 0; i < locationParameters.length; i++) {
            locationParameters[i].trim();
        }
        if(locationParameters.length === 3) getWeatherDataNormal(locationParameters[0], locationParameters[1], locationParameters[2]);
    });
});