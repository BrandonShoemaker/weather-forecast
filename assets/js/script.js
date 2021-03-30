function buildHistory(history){
    for (let i = 0; i < history.length; i++) {
        var buttonEl = $("<button>");
        buttonEl.addClass("btn-predefined-location p-1 text-light rounded-pill");
        buttonEl.text(history[i].value);
        $("#history-container").append(buttonEl);
    } 
}

function setStorage(location){
    var historyObj = {
        value: location
    };

    var history = getStorage();

    if(history){
        for (let i = 0; i < history.length; i++) {
            if(historyObj.value === history[i].value) return;
        }
    
        if(history.length === 8){
            history.splice(0, 1);
        }
        history.push(historyObj);

    }
    else history = [historyObj];
    
    buildHistory(history);

    localStorage.setItem("history", JSON.stringify(history));
}

function getStorage(){
    var history = JSON.parse(localStorage.getItem("history"));
    if(!history) {
        history = [];
        return
    }   
    return history;
}

function setIdText(id, data) {
    $(id).text(data);
}

function kelvinToFar(temp){
    return parseInt((((temp)-273.15) * 9/5 + 32), 10);
}

function utcToNormalTime(seconds) {
    var sec = seconds;
    var date = new Date(sec * 1000);
    var timestr = date.toLocaleTimeString();
    return timestr;
}

function printError(){
    setTimeout(() => {
        $("#errorPrinter").text("");
    }, 5000);
}

function setCurrentDayWeather(data) {
    fetch("https://api.openweathermap.org/data/2.5/onecall?lat="+ data.city.coord.lat +"&lon="+ data.city.coord.lon +"&appid=1dbf052af59023935e40459b0107bc1a")
    .then(response => {
        if(response.ok) return response.json();
    })
    .then(uvInfo => {
        setIdText("#uv", uvInfo.current.uvi);
        if(uvInfo.current.uvi < 3){
            $("#uv").addClass("p-1 bg-success");
        }
        else if(uvInfo.current.uvi >= 3 && uvInfo.current.uvi < 6 ){
            $("#uv").addClass("p-1 bg-warning");
        }
        else {
            $("#uv").addClass("p-1 bg-danger");
        }

        fetch("http://api.openweathermap.org/data/2.5/weather?lat="+ data.city.coord.lat +"&lon="+ data.city.coord.lon +"&appid=1dbf052af59023935e40459b0107bc1a")
        .then(response => {
            if(response.ok) return response.json();
        })
        .then(data2 => {
            setIdText("#current-temp", kelvinToFar(data2.main.temp));  
            setIdText("#real-feel", kelvinToFar(data2.main.feels_like));
            setIdText("#high", kelvinToFar(data2.main.temp_max));
            setIdText("#low", kelvinToFar(data2.main.temp_min));
            setIdText("#humidity", data2.main.humidity);  
            setIdText("#wind-speed", data2.wind.speed * 2.237);  
            setIdText("#wind-direction", data2.wind.deg);
            if(data2.clouds.all === 1){
                setIdText("#cloudiness", data2.clouds.all);
            }
            else{
                setIdText("#cloudiness", data2.clouds.all);
            }
            
            setIdText("#rise", utcToNormalTime(data2.sys.sunrise));
            setIdText("#set", utcToNormalTime(data2.sys.sunset)); 
        })
        .catch(error => {
            $("#errorPrinter").text("Error: Unable to complete request for todays data. Try again.");
            printError();
        });
    })
    .catch(error => {
        $("#errorPrinter").text("Error: Unable to complete request for UV. Try again.");
        printError();
    });
}

function makeLowerCase(str){
    return str.toLowerCase();
}

function getWeatherForecast(city, state, country, location) {
    city = makeLowerCase(city);
    city = city.charAt(0).toUpperCase()+city.slice(1);
    state = state.toUpperCase();
    country = country.toUpperCase();
    var goodConnection = true;
    
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

            var kelvinToFarVar = kelvinToFar(data.list[midDayIncrementor].main.temp);
            var thisDiv = $(this);
            thisDiv.find("h3").text(data.list[midDayIncrementor].dt_txt.substr(0,10));

            console.log(data.list[midDayIncrementor].dt_txt.substr(0,10));

            thisDiv.find("img").attr("src", "http://openweathermap.org/img/wn/"+ data.list[midDayIncrementor].weather[0].icon +"@2x.png");
            thisDiv.find("img").attr("alt", data.list[midDayIncrementor].weather[0].description);

            for (let i = 0; i < 2; i++) {
                if(i === 0){
                    thisDiv.find("p[data-pIndex='" + i + "']").html("Temperature: "+kelvinToFarVar+"&deg;");
                }
                else{
                    thisDiv.find("p[data-pIndex='" + i + "']").text("Humidity: "+data.list[midDayIncrementor].main.humidity+"%");
                }
            }
            midDayIncrementor += 8;
        });
        setCurrentDayWeather(data);
    })
    .catch(error => {
        $("#errorPrinter").text("Error: Unable to complete request for forecast. Try again.");
        printError();
        goodConnection = false
    });

    if(goodConnection === true) setStorage(location);

}



$(document).ready(function () {
    var today = new Date();
    var month = String(today.getMonth() + 1).padStart(2, '0');
    var day = String(today.getDate()).padStart(2, '0');
    var year = today.getFullYear();
    $("#current-date").text(month + "-" + day + "-" +year);

    var history = getStorage();
    buildHistory(history);

    $("#form-container").on("click", "button", function() {
        var location = $("#form-container").find("input").val().trim();
        var locationParameters = location.split(" ");
        for (let i = 0; i < locationParameters.length; i++) {
            if(locationParameters[i][locationParameters.length-1] === ",") locationParameters[i].splice(locationParameters.length-1, 1);
        }
        
        if(locationParameters.length === 3) getWeatherForecast(locationParameters[0], locationParameters[1], locationParameters[2], location);
        
    });

    $("#history-container").on("click", "button", function(){
        var location = $(this).text();
        $("#form-container").find("input").val(location);
        var locationParameters = location.split(" ");
        for (let i = 0; i < locationParameters.length; i++) {
            if(locationParameters[i][locationParameters.length-1] === ",") locationParameters[i].splice(locationParameters.length-1, 1);
        }
        
        if(locationParameters.length === 3) getWeatherForecast(locationParameters[0], locationParameters[1], locationParameters[2], location);
    });
});
