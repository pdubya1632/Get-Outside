// get API Key from config object
const OWMkey = config.OWMkey;

// initiate lat lng global variables, set to Seattle by default
let lat = "47.608013";
let lng = "-122.335167";

// get lat lng from autocomplete input
function initialize() {
  var input = document.getElementById("searchCity");
  var autocomplete = new google.maps.places.Autocomplete(input);
  google.maps.event.addListener(autocomplete, "place_changed", function () {
    var place = autocomplete.getPlace();
    lat = place.geometry.location.lat();
    lng = place.geometry.location.lng();

    console.log(lat + ", " + lng);
    getHikes(lat, lng);
  });
}

// get 20 'best hikes' based on city search
const getHikes = (lat, lng) => {
  const coord = new google.maps.LatLng(lat, lng);

  const map = new google.maps.Map(document.getElementById("map"), {
    center: coord,
    zoom: 15,
  });

  const request = {
    location: coord,
    radius: "500",
    query: "best hikes",
    type: ["point_of_interest"],
  };

  const service = new google.maps.places.PlacesService(map);
  service.textSearch(request, callback);
};

// push first 5 'best hikes' results into Results sidebar
function callback(results, status) {
  console.log(results);

  const cards = document.getElementById("cards");

  let name = results[i].name;

  for (var i = 0; i <= 5; i++) {
    cards.innerHTML +=
        `<div class="card block">
        <header class="card-header">
            <p class="card-header-title" data-lon="" data-lng="">${name}</p>
            <button class="card-header-icon" aria-label="more options">
            <span class="icon">
                <i class="fas fa-angle-down" aria-hidden="true"></i>
            </span>
            </button>
        </header>
        </div>`;
  }
}

// onclick hike > getWeather(lat, lng);

// get weather based on coordinates from google autocomplete
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

// trigger initialize upon page load
google.maps.event.addDomListener(window, "load", initialize);