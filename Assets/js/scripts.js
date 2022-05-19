// get API Key from config object
const OWMkey = config.OWMkey;

// get lat lng from autocomplete input
function initialize() {
  var input = document.getElementById("searchCity");
  var autocomplete = new google.maps.places.Autocomplete(input);
  google.maps.event.addListener(autocomplete, "place_changed", function () {
    var place = autocomplete.getPlace();
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    console.log(lat + ", " + lng);
    // placeholder for future map load
    // loadMap(latSearch,lngSearch)
    listHikes(lat, lng);
    getWeather(lat, lng);
  });
}

// trigger initialize upon page load
google.maps.event.addDomListener(window, "load", initialize);

const listHikes = (lat, lng) => {
    const coord = new google.maps.LatLng(lat, lng);

    const map = new google.maps.Map(document.getElementById('map'), {
        center: coord,
        zoom: 15
      });

  const request = {
    location: coord,
    radius: "500",
    query: "best hikes",
    type: ["point_of_interest"]
  };

  const service = new google.maps.places.PlacesService(map);
  service.textSearch(request, callback);
};

function callback(results, status) {
  console.log(results);
}

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
