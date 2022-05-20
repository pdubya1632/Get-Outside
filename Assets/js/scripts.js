// get API Key from config object
const OWMkey = config.OWMkey;

let lat = "47.608013";
let lng = "-122.335167";
let map;
let bounds;
let service;

let searchResults = document.getElementsByClassName(".results");

// get lat lng from city search
function initialize() {
  bounds = new google.maps.LatLngBounds();
  let infoWindow = new google.maps.InfoWindow();
  let currentInfoWindow = infoWindow;

  const input = document.getElementById("search-input");
  const autocomplete = new google.maps.places.Autocomplete(input);
  google.maps.event.addListener(autocomplete, "place_changed", function () {
    var place = autocomplete.getPlace();
    lat = place.geometry.location.lat();
    lng = place.geometry.location.lng();
    console.log(place);
    console.log(lat + ", " + lng);
    getHikes(lat, lng);
  });
}

// get 20 'best hikes' nearby lat lng
const getHikes = (lat, lng) => {
  const coord = new google.maps.LatLng(lat, lng);

  searchResults.innerHTML += `<div id="map"></div>`;

  map = new google.maps.Map(document.getElementById("map"), {
    center: coord,
    zoom: 15,
  });

  const request = {
    location: coord,
    radius: "10000",
    query: "best hikes",
  };

  const service = new google.maps.places.PlacesService(map);
  service.textSearch(request, callback);
};

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    listHikes(results);
  }
}

// push first 5 'best hikes' results onto page
function listHikes(results, status) {
  console.log(results);

  const cards = document.getElementById("cards");

  for (var i = 0; i < 5; i++) {
    let name = results[i].name;
    cards.innerHTML += `<div class="card block">
          <header class="card-header">
              <p class="card-header-title hikeBtn" data-lat="${lat}" data-lng="${lng}">${name}</p>
              <button class="card-header-icon" aria-label="more options">
              <span class="icon">
                  <i class="fas fa-angle-down" aria-hidden="true"></i>
              </span>
              </button>
          </header>
          </div>`;
  }

  // set click listener to all cards created in loop above
  document.querySelectorAll(".hikeBtn").forEach((item) => {
    item.addEventListener("click", (event) => {
      getWeather(item.getAttribute("data-lat"), item.getAttribute("data-lng"));
    });
  });

  createMarkers(results);
}

// Set markers at the location of each place result
function createMarkers(places) {
  places.forEach((place) => {
    let marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      title: place.name,
    });

    // Add click listener to each marker
    google.maps.event.addListener(marker, "click", () => {
      let request = {
        placeId: place.place_id,
        fields: [
          "name",
          "formatted_address",
          "geometry",
          "rating",
          "website",
          "photos",
        ],
      };

      /* Only fetch the details of a place when the user clicks on a marker.
       * If we fetch the details for all place results as soon as we get
       * the search response, we will hit API rate limits. */
      // service.getDetails(request, (placeResult, status) => {
      //   showDetails(placeResult, marker, status);
      // });
    });

    bounds.extend(place.geometry.location);
  });

  map.fitBounds(bounds);
}

// Builds an InfoWindow to display details above the marker
function showDetails(placeResult, marker, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    let placeInfowindow = new google.maps.InfoWindow();
    let rating = "None";
    if (placeResult.rating) rating = placeResult.rating;
    placeInfowindow.setContent(
      "<div><strong>" +
        placeResult.name +
        "</strong><br>" +
        "Rating: " +
        rating +
        "</div>"
    );
    placeInfowindow.open(marker.map, marker);
    currentInfoWindow.close();
    currentInfoWindow = placeInfowindow;
    showPanel(placeResult);
  } else {
    console.log("showDetails failed: " + status);
  }
}

// get weather based on coordinates of selected hike
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

      let temp = document.getElementById("temp");
      temp.innerHTML = data.current.temp;
    });
};

// trigger initialize upon page load
google.maps.event.addDomListener(window, "load", initialize);
