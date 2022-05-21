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

/**
 * Get the weather data for a location
 * @param {number} lat latitude of hike location 
 * @param {number} lng longitude of hike location
 * @returns {Promise} promise from response.json()
 */
async function getWeather(lat, lng) {
    const queryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&units=imperial&exclude=minutely,hourly,alerts&appid=${config.OWMkey}`;

    return fetch(queryURL)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
    })
    .catch(error => console.log(`Error fetching weather for ${lat}, ${lng}: ${error}`));
}

/**
 * Creates card for a search result
 * @param {object} searchResultObj object that encapsulates relevant data for each search result from the google places api 
 * @returns {object} A card div
 */
function createResultCard(searchResult) {

    // test result object
    searchResultObj = {
        lat: 47.608013,
        lng: -122.335167,
        name: "Hike name",
        rating: 4.7,
        numReviews: 123,
        elevation: 3200
    };

    // create card container
    const containterCardEl = document.createElement("div");
    let cls = ["container-card", "card", "is-rounded", "my-3"];
    containterCardEl.classList.add(...cls);

    // create card header
    const containerHeaderEl = document.createElement("div");
    cls = ["container-header", "card-header", "mb-2"];
    containerHeaderEl.classList.add(...cls);
    const headerPEl = document.createElement("p");
    headerPEl.classList.add("card-header-title", "has-background-info", "has-text-white-bis", "is-size-4");
    headerPEl.textContent = searchResultObj.name;
    containerHeaderEl.append(headerPEl);

    // create container card body div
    const containerBodyEl = document.createElement("div");
    cls = ["container-body", "card-content"];
    containerBodyEl.classList.add(...cls);

    getWeather(searchResultObj.lat, searchResultObj.lng)
    .then(data => {
        const currentWeatherObj = {
            "Temp": Math.round(data.current.temp) + "°F",
            "Wind": Math.round(data.current.wind_speed) + " MPH",
            "Humidity": Math.round(data.current.humidity) + "%",
            "UV Index": Math.round(data.current.uvi),
            "icon": data.current.weather[0].icon
        };

        containerBodyEl.append(createWeatherCard(currentWeatherObj));
        containterCardEl.append(containerHeaderEl, containerBodyEl);
        document.querySelector('#listColumn').append(containterCardEl);
    });
}

/**
 * Creates the weather card component
 * @param {object} weatherDataObj object that encapsulates weather data
 * @returns weather card component
 */
function createWeatherCard(weatherDataObj) {
    // create weather card
    const weatherCardContainerEl = document.createElement("div");
    cls = ["weather-card-container", "p-0", "is-6", "columns", "is-centered"];
    weatherCardContainerEl.classList.add(...cls);

    // create weather card
    const weatherCardEl = document.createElement("div");
    cls = ["weather-card", "card", "m-1"];
    weatherCardEl.classList.add(...cls);

    // create weather image
    const weatherCardImgEl = document.createElement("img");
    cls = ["weather-img", "image", "is-48x48"];
    weatherCardImgEl.classList.add(...cls);
    weatherCardImgEl.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherDataObj["icon"] + "@2x.png");
    weatherCardImgEl.setAttribute("alt", "weather condition image");

    // create weather card header
    const weatherHeaderEl = document.createElement("div");
    cls = ["weather-header", "card-header", "has-text-centered"];
    weatherHeaderEl.classList.add(...cls);
    const headerPEl = document.createElement("p");
    headerPEl.classList.add("card-header-title", "pr-0", "has-text-info");
    headerPEl.textContent = "Current Conditions";
    weatherHeaderEl.append(headerPEl, weatherCardImgEl);

    // create weather body
    const weatherCardBodyEl = document.createElement("div");
    cls = ["weather-body", "card-content", "column", "is-10", "is-offset-2"];
    weatherCardBodyEl.classList.add(...cls);

    // create weather text
    const weatherCardTextEl = document.createElement("div");
    cls = ["weather-text", "content"];
    weatherCardTextEl.classList.add(...cls);

    // loop over the weatherDataObj and add to weatherCartTextEl
    for (const property in weatherDataObj) {

        // skip icon property
        if (property === "icon") {
            break;
        }

        const propertyDiv = document.createElement("div");
        propertyDiv.textContent = `${property}: ${weatherDataObj[property]}`;
        propertyDiv.classList.add("px-2")

        weatherCardTextEl.append(propertyDiv);
    }

    // append weather elements to card
    weatherCardBodyEl.append(weatherCardTextEl);
    weatherCardEl.append(weatherHeaderEl, weatherCardBodyEl);
    weatherCardContainerEl.append(weatherCardEl);
    return weatherCardContainerEl;
}

// trigger initialize upon page load
google.maps.event.addDomListener(window, "load", initialize);
