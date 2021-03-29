

function makeLowerCase(str){
    return str.toLowerCase();
}

function getWeatherDataNormal(city, state, country) {
    city = makeLowerCase(city);
    city = city.charAt(0).toUpperCase()+city.slice(1);
    state = state.toUpperCase();
    country = country.toUpperCase();
    
    var apiUrl;
    if(!country){
        if(!state){
            apiUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=1dbf052af59023935e40459b0107bc1a";
        }
        else{
            apiUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "," + state +"&appid=1dbf052af59023935e40459b0107bc1a";
        }
    }
    else{
        apiUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "," + state + "," + country +"&appid=1dbf052af59023935e40459b0107bc1a";
    }

    fetch(apiUrl).then(response => {

        if(response.ok){
            return response.json();
        }
    })
    .then(data => {
        console.log(data);
        var midDayIncrementor = 4;
        $("#card-container").children().each(function(){

            var kelvinToFar = parseInt((((data.list[midDayIncrementor].main.temp)-273.15) * 9/5 + 32), 10);
            var thisDiv = $(this);
            thisDiv.find("h3").text(data.list[midDayIncrementor].dt_txt.substr(0,10));

            console.log(data.list[midDayIncrementor].dt_txt.substr(0,10));

            thisDiv.find("img").attr("src", "http://openweathermap.org/img/wn/"+ data.list[midDayIncrementor].weather[0].icon +"@2x.png");
            thisDiv.find("img").attr("alt", data.list[midDayIncrementor].weather[0].description);

            for (let i = 0; i < 2; i++) {
                if(i === 0){
                    thisDiv.find("p[data-pIndex='" + i + "']").html("Temperature: "+kelvinToFar+"&deg;");
                }
                else{
                    thisDiv.find("p[data-pIndex='" + i + "']").text("Humidity: "+data.list[midDayIncrementor].main.humidity+"%");
                }
            }
            midDayIncrementor += 8;
        })
    })
}

$(document).ready(function () {
    $("#form-container").on("click", "button", function() {
        var location = $("#form-container").find("input").val().trim();
        var locationParameters = location.split(" ");
        for (let i = 0; i < locationParameters.length; i++) {
            if(locationParameters[i][locationParameters.length-1] === ",") locationParameters[i].splice(locationParameters.length-1, 1);
            if()
        }
        if(locationParameters.length === 3) getWeatherDataNormal(locationParameters[0], locationParameters[1], locationParameters[2]);
        
    });
});