// builds buttons for history
function buildHistory(history){
    // creates all history buttons based on list of histories passed
    for (let i = 0; i < history.length; i++) {
        var buttonEl = $("<button>");
        buttonEl.addClass("btn-predefined-location p-1 text-light rounded-pill");
        buttonEl.text(history[i].value);
        $("#history-container").append(buttonEl);
    } 
}

// sets histories in storage
function setStorage(location){
    // creates object for history
    var historyObj = {
        value: location
    };

    // returns history that was stored last
    var history = getStorage();

    // if history exists
    if(history){
        // if there is a history entry that already exists, skip saving
        for (let i = 0; i < history.length; i++) {
            if(historyObj.value === history[i].value) return;
        }
        // if there are already 8 histories, remove the oldest
        if(history.length === 8){
            history.splice(0, 1);
        }
        // add new history
        history.push(historyObj);

    }
    // if no history, make history
    else history = [historyObj];
    
    // builds history buttons
    buildHistory(history);

    // formats and saves histories to localstorage
    localStorage.setItem("history", JSON.stringify(history));
}

function getStorage(){
    // grabs history fro local storage and formats it
    var history = JSON.parse(localStorage.getItem("history"));
    // if doesnt exist, make empty
    if(!history) {
        history = [];
        return
    }   
    return history;
}

// lazy function to find an id and assign a value to it
function setIdText(id, data) {
    $(id).text(data);
}

// translates kelvin to farenheit
function kelvinToFar(temp){
    return parseInt((((temp)-273.15) * 9/5 + 32), 10);
}

// translates utc time to normal time
function utcToNormalTime(seconds) {
    var sec = seconds;
    // utc time is in seconds, so format as such
    var date = new Date(sec * 1000);
    // translates the date to a human readable format
    var timestr = date.toLocaleTimeString();
    return timestr;
}

// removes the printed error after 5 seconds
function printError(){
    setTimeout(() => {
        $("#errorPrinter").text("");
    }, 5000);
}

// sets the stats for the current day at the searched location
function setCurrentDayWeather(data) {
    // fetches from the UV api using the lon and lat of the city searched by city name or more
    fetch("https://api.openweathermap.org/data/2.5/onecall?lat="+ data.city.coord.lat +"&lon="+ data.city.coord.lon +"&appid=1dbf052af59023935e40459b0107bc1a")
    .then(response => {
        // if the connection succeded continue
        if(response.ok) return response.json();
    })
    .then(uvInfo => {
        // sets the uv
        setIdText("#uv", uvInfo.current.uvi);
        // changes color of uv based on its severity
        if(uvInfo.current.uvi < 3){
            $("#uv").addClass("p-1 bg-success");
        }
        else if(uvInfo.current.uvi >= 3 && uvInfo.current.uvi < 6 ){
            $("#uv").addClass("p-1 bg-warning");
        }
        else {
            $("#uv").addClass("p-1 bg-danger");
        }

        // nested fetch for current day api to make up for what the uv api lacks
        fetch("http://api.openweathermap.org/data/2.5/weather?lat="+ data.city.coord.lat +"&lon="+ data.city.coord.lon +"&appid=1dbf052af59023935e40459b0107bc1a")
        .then(response => {
            // if response is successful continue
            if(response.ok) return response.json();
        })
        .then(data2 => {
            // sets all current day stats for the searched location
            setIdText("#current-temp", kelvinToFar(data2.main.temp));  
            setIdText("#real-feel", kelvinToFar(data2.main.feels_like));
            setIdText("#high", kelvinToFar(data2.main.temp_max));
            setIdText("#low", kelvinToFar(data2.main.temp_min));
            setIdText("#humidity", data2.main.humidity);  
            setIdText("#wind-speed", data2.wind.speed * 2.237);  
            setIdText("#wind-direction", data2.wind.deg);
            if(data2.clouds.all === 1){
                setIdText("#cloudiness", "Yes");
            }
            else{
                setIdText("#cloudiness", "No");
            }
            
            setIdText("#rise", utcToNormalTime(data2.sys.sunrise));
            setIdText("#set", utcToNormalTime(data2.sys.sunset)); 
        })
        // if an error occurs at some point
        .catch(error => {
            $("#errorPrinter").text("Error: Unable to complete request for todays data. Try again.");
            printError();
        });
    })
    // if an error occurs at some point
    .catch(error => {
        $("#errorPrinter").text("Error: Unable to complete request for UV. Try again.");
        printError();
    });
}

// lazy function for making a string all lowercase
function makeLowerCase(str){
    return str.toLowerCase();
}

// main search function
function getWeatherForecast(city, state, country, location) {
    // formats all necessary parameters
    city = makeLowerCase(city);
    city = city.charAt(0).toUpperCase()+city.slice(1);
    state = state.toUpperCase();
    country = country.toUpperCase();
    // for the history update function
    var goodConnection = true;
    
    var apiUrl;
    // various conditions that will dictate what the api url will look like based on what parameter are present
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

    // beginning of the apiurl fetch
    fetch(apiUrl).then(response => {
        // if connection succeded
        if(response.ok){
            return response.json();
        }
    })
    .then(data => {
        console.log(data);
        // uses the middle of the day of the 5day/3hour api for each day
        var midDayIncrementor = 4;
        // for each of the children of the forecast
        $("#card-container").children().each(function(){

            // gets farenheit
            var kelvinToFarVar = kelvinToFar(data.list[midDayIncrementor].main.temp);
            var thisDiv = $(this);
            // grabs date from the api of the day its on and prints to the card
            thisDiv.find("h3").text(data.list[midDayIncrementor].dt_txt.substr(0,10));

            console.log(data.list[midDayIncrementor].dt_txt.substr(0,10));
            // imports and places the apis icons to the forecast cards
            thisDiv.find("img").attr("src", "http://openweathermap.org/img/wn/"+ data.list[midDayIncrementor].weather[0].icon +"@2x.png");
            thisDiv.find("img").attr("alt", data.list[midDayIncrementor].weather[0].description);

            // cycles through the p tags of the cards
            for (let i = 0; i < 2; i++) {
                // if one or the other p tag do something
                if(i === 0){
                    thisDiv.find("p[data-pIndex='" + i + "']").html("Temperature: "+kelvinToFarVar+"&deg;");
                }
                else{
                    thisDiv.find("p[data-pIndex='" + i + "']").text("Humidity: "+data.list[midDayIncrementor].main.humidity+"%");
                }
            }
            // increments the counter the next middle of the day
            midDayIncrementor += 8;
        });
        setCurrentDayWeather(data);
    })
    // if anything happens print error
    .catch(error => {
        $("#errorPrinter").text("Error: Unable to complete request for forecast. Try again.");
        printError();
        goodConnection = false
    });

    // if connection didnt fail, set the storage
    if(goodConnection === true) setStorage(location);

}


// on all document content loaded
$(document).ready(function () {
    // creates the current day, formats it, and then prints 
    var today = new Date();
    var month = String(today.getMonth() + 1).padStart(2, '0');
    var day = String(today.getDate()).padStart(2, '0');
    var year = today.getFullYear();
    $("#current-date").text(month + "-" + day + "-" +year);

    // builds all history buttons
    var history = getStorage();
    buildHistory(history);

    // if the search button is clicked
    $("#form-container").on("click", "button", function() {
        // grab input
        var location = $("#form-container").find("input").val().trim();
        // splits input to manageabe segments
        var locationParameters = location.split(" ");
        // strips segments to be trimmed of any commas
        for (let i = 0; i < locationParameters.length; i++) {
            if(locationParameters[i][locationParameters.length-1] === ",") locationParameters[i].splice(locationParameters.length-1, 1);
        }
        // so long as there are 3
        if(locationParameters.length === 3) getWeatherForecast(locationParameters[0], locationParameters[1], locationParameters[2], location);
        
    });

    // if a history button is clicked, do the same as above
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
