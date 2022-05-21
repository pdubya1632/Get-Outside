let map;
let coord;
let infoWindow;
let currentInfoWindow;
let bounds;
let service;

// get lat lng from city search
function initialize() {
  document.querySelector("#result-list").innerHTML = "";
  bounds = new google.maps.LatLngBounds();
  infoWindow = new google.maps.InfoWindow();
  currentInfoWindow = infoWindow;

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

  const mapColumn = document.getElementById("result-map");
  mapColumn.innerHTML = "";
  const mapDiv = document.createElement("div");
  mapDiv.id = "map";
  mapColumn.append(mapDiv);

  map = new google.maps.Map(mapDiv, {
    center: coord,
    zoom: 14,
  });

  getList(coord);
}

function getList(coord) {
  let request = {
    location: coord,
    radius: "10000",
    query: "mountain trail",
  };

  service = new google.maps.places.PlacesService(map);
  service.textSearch(request, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      initialize();
      handlePlacesResults(results);
      for (var i = 0; i < 5; i++) {
        createMarkers(results[i]);
      }
      map.setCenter(results[0].geometry.location);
    }
  });
}

function handlePlacesResults(results) {
    let placeResultObj;
    for (let i = 0; i < 5; i++) {
        const placeResultObj = {
            lat: results[i].geometry.location.lat(),
            lng: results[i].geometry.location.lng(),
            name: results[i].name,
            address: results[i].formatted_address,
            rating: results[i].rating,
            placeId: results[i].place_id,
        };
        createResultCard(placeResultObj);
    }
}

// push first 5 'best hikes' results into list
// function listHikes(place) {

//     let name = place.name;
//     let address = place.formatted_address;
//     let rating = place.rating;
//     let placeId = place.place_id;

//     const listColumn = document.getElementById("listColumn");
//     listColumn.innerHTML += `<div class="card" data-placeId="${placeId}" data-lat="${lat}" data-lng="${lng}">  
//     <header class="card-header">
//             <p class="card-header-title hikeBtn">
//             ${name}
//             </p>
//             <button class="card-header-icon" aria-label="more options">
//               <span class="icon">
//                 <i class="fas fa-angle-down" aria-hidden="true"></i>
//               </span>
//             </button>
//           </header>
//           <div class="card-content">
//             <div class="content">
//             <ul>
//             <li>Rating: ${rating}</li>
//             <li>Current Conditions below...</li>
//             </ul>
//             </div>
//           </div>
//           <footer class="card-footer">
//             <a href="https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${placeId}" class="card-footer-item" target="_blank">Get Directions</a>
//           </footer>
//         </div>`;
//   }

// Set markers at the location of each place result
function createMarkers(place) {
  let markers = [];
    
    let marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      title: place.name,
    });

    markers.push(marker);

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
          "place_id"
        ],
      };

      service.getDetails(request, (placeResult, status) => {
        showDetails(placeResult, marker, status);
      });
    });

    bounds.extend(place.geometry.location);
    map.fitBounds(bounds);

}

// create InfoWindow to display details above the marker
function showDetails(placeResult, marker, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    let placeInfowindow = new google.maps.InfoWindow();
    let rating = "None";

    if (placeResult.rating) rating = placeResult.rating;
    placeInfowindow.setContent(
      `<div>
      <strong>${placeResult.name}</strong>
      <br>
      Rating:${rating}
      <br>
      <a href="https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${placeResult.place_id}" target="_blank">Get Directions</a>
      </div>`
    );
    placeInfowindow.open(marker.map, marker);
    currentInfoWindow.close();
    currentInfoWindow = placeInfowindow;

    // todo: connect markers and list items
    //let cards = document.querySelectorAll(".card");
    //let value = cards.getAttribute("data-state");
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
function createResultCard(searchResultObj) {

    // create card container
    const containterCardEl = document.createElement("div");
    let cls = ["container-card", "card", "is-rounded", "mb-5"];
    containterCardEl.classList.add(...cls);

    // create card header
    const containerHeaderEl = document.createElement("div");
    cls = ["container-header", "card-header", "mb-2"];
    containerHeaderEl.classList.add(...cls);
    const headerPEl = document.createElement("p");
    headerPEl.classList.add("card-header-title", "has-background-warning-light", "has-text-info-dark", "is-size-5", "pl-5");
    headerPEl.textContent = searchResultObj.name;
    containerHeaderEl.append(headerPEl);

    // create container card body div
    const containerBodyEl = document.createElement("div");
    cls = ["container-body", "card-content", "pt-1"];
    containerBodyEl.classList.add(...cls);

    // create photos image
    const resultDetails = document.createElement("div");
    cls = ["result-details", "card-text", "mb-3"];
    resultDetails.classList.add(...cls);
    resultDetails.innerHTML = `<p class="is-size-5 has-text-centered has-text-weight-semibold">${searchResultObj.rating} Stars</p>
                                <p class="is-size-7 has-text-centered">${searchResultObj.address}</p>`;

    const footer = document.createElement("footer");
    cls = ["card-footer", "mt-3"];
    footer.classList.add(...cls);
    footer.innerHTML = `<a href="https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${searchResultObj.placeId}" class="button is-link card-footer-item" target="_blank">Get Directions</a>`;
    // append to card body
    containerBodyEl.append(resultDetails);

    getWeather(searchResultObj.lat, searchResultObj.lng)
    .then(data => {
        const currentWeatherObj = {
            "Temp": Math.round(data.current.temp) + "°F",
            "Wind": Math.round(data.current.wind_speed) + " MPH",
            "Humidity": Math.round(data.current.humidity) + "%",
            "UV Index": Math.round(data.current.uvi),
            "icon": data.current.weather[0].icon
        };
        containerBodyEl.append(createWeatherCard(currentWeatherObj), footer);
        containterCardEl.append(containerHeaderEl, containerBodyEl);
        document.querySelector('#result-list').append(containterCardEl);
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
    cls = ["weather-card-container", "p-0", "is-centered"];
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
