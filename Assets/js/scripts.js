// get API Key from config object
const OWMkey = config.OWMkey;

let lat;
let lng;
let map;
let coord;
let infoWindow;
let currentInfoWindow;
let bounds;
let service;

const mapDiv = document.getElementById("map");

// get lat lng from city search
function initialize() {
  bounds = new google.maps.LatLngBounds();
  let infoWindow = new google.maps.InfoWindow();
  let currentInfoWindow = infoWindow;

  const input = document.getElementById("search-input");
  const autocomplete = new google.maps.places.Autocomplete(input);
  google.maps.event.addListener(autocomplete, "place_changed", function () {
    let place = autocomplete.getPlace();
    lat = place.geometry.location.lat();
    lng = place.geometry.location.lng();

    console.log(place);
    console.log(lat + ", " + lng);

    loadMap(lat, lng);
  });
}

// load map centered on search location
function loadMap(latSearch, lngSearch) {
  const coord = new google.maps.LatLng(lat, lng);

  const mapColumn = document.getElementById("mapColumn");
  const mapDiv = document.createElement("div");
  mapDiv.id = "map";
  mapColumn.append(mapDiv);

  map = new google.maps.Map(mapDiv, {
    center: coord,
    zoom: 15,
  });

  getList(coord);
}

function getList(coord) {
  let request = {
    location: coord,
    radius: "5000",
    query: "best hikes",
  };

  service = new google.maps.places.PlacesService(map);
  service.textSearch(request, listCallback);
}

function listCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    listHikes(results);
  }
}

// push first 5 'best hikes' results into list
function listHikes(results, status) {
  console.log(results);

  for (var i = 0; i < 5; i++) {
    let name = results[i].name;
    let address = results[i].formatted_address;
    let rating = results[i].rating;
    let placeId = results[i].place_id;

    const listColumn = document.getElementById("listColumn");
    listColumn.innerHTML += `<div class="card">
          <header class="card-header">
            <p class="card-header-title hikeBtn" data-lat="${lat}" data-lng="${lng}">
            ${name}
            </p>
            <button class="card-header-icon" aria-label="more options">
              <span class="icon">
                <i class="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </header>
          <div class="card-content">
            <div class="content">
            <ul>
            <li>Rating: ${rating}</li>
            <li>${address}</li>
            </ul>
            </div>
          </div>
          <footer class="card-footer">
            <a href="https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${placeId}" class="card-footer-item" target="_blank">Get Directions</a>
          </footer>
        </div>`;
  }

  // set click listener to all cards created in loop above
  document.querySelectorAll(".hikeBtn").forEach((item) => {
    item.addEventListener("click", (event) => {
      console.log("weather clicked");
      //getWeather(item.getAttribute("data-lat"), item.getAttribute("data-lng"));
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

      service.getDetails(request, (placeResult, status) => {
        showDetails(placeResult, marker, status);
      });
    });

    bounds.extend(place.geometry.location);
  });

  map.fitBounds(bounds);
}

// create InfoWindow to display details above the marker
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
    // showPanel(placeResult);
  } else {
    console.log("showDetails failed: " + status);
  }
}

// get weather based on coordinates of selected list item
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
