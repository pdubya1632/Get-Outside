// get API Key from config object
const OWMkey = config.OWMkey;

// get lat lng from autocomplete input
function initialize() {
    var input = document.getElementById('searchCity');
    var autocomplete = new google.maps.places.Autocomplete(input);
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        var place = autocomplete.getPlace();
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        console.log(lat + ", " + lng);
        // document.getElementById('lat').value = latSearch;
        // document.getElementById('lon').value = lngSearch;
        // loadMap(latSearch,lngSearch)

        getWeather(lat,lng);
    });
}

// trigger initialize upon page load
google.maps.event.addListener(window, 'load', initialize); 

// get weather based on coordinates from google
const getWeather = (lat, lng) => {
    let queryURL =
      "https://api.openweathermap.org/data/2.5/onecall?lat=" +
      lat +
      "&lon=" +
      lng +
      "&units=imperial&exclude=minutely,hourly,alerts&appid=" +
      OWMkey;
  
    fetch(queryURL)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      });
  };