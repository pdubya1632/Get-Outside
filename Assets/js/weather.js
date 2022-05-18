/*** API URLS ***/
//const WEATHER_URL =
//  "https://api.openweathermap.org/data/2.5/weather?appid=ad19330a1a85eb38a78e85ceaba0c320";

// // GET LAT LON FROM PLACES API
// window.addEventListener("load", initialize);

// function initialize() {
//   const input = document.getElementById("address");
//   const autocomplete = new google.maps.places.Autocomplete(input);
// //   autocomplete.addListener("place_changed", function () {
// //     const place = autocomplete.getPlace();
// //     // place variable will have all the information you are looking for.

// //     document.getElementById("latitude").value =
// //       place.geometry["location"].lat();
// //     document.getElementById("longitude").value =
// //       place.geometry["location"].lng();
// //   });
// }

// GET WEATHER FOR SEARCHED / SELECTED CITY
const getWeather = (city, lat, lon) => {
    let queryURL =
      "https://api.openweathermap.org/data/2.5/onecall?lat=" +
      lat +
      "&lon=" +
      lon +
      "&units=imperial&exclude=minutely,hourly,alerts&appid=" +
      OWMkey;
  
    fetch(queryURL)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
  
        // selectedCity.innerHTML = "";
  
        // let tempCurrent = document.getElementById("temp-current");
        // let windCurrent = document.getElementById("wind-current");
        // let humidityCurrent = document.getElementById("humidity-current");
        // let uviCurrent = document.getElementById("uvi-current");
        // let icon = data.current.weather[0].icon;
  
        // selectedCity.innerHTML += `<span>${city}</span>`;
        // selectedCity.innerHTML += ` <span>(${today})</span>`;
        // selectedCity.innerHTML += ` <img src="https://openweathermap.org/img/wn/${icon}@2x.png" width="50" height="50">`;
  
        // tempCurrent.innerHTML = data.current.temp;
        // windCurrent.innerHTML = data.current.wind_speed;
        // humidityCurrent.innerHTML = data.current.humidity;
  
        // let weatherResults = document.getElementById("weather-results");
        // weatherResults.style.visibility = "visible";
      });
  };

//const city = document.getElementsByClassName("city");
//city.addEventListener("click", getLatLon(Seattle, 47.60621, -122.33207));

const city = document.getElementById("seattle");
city.addEventListener("click", function() { getWeather('Seattle', 47.60621, -122.33207) }, false);
