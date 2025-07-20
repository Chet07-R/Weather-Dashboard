const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationbutton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = 'bb0059cb50f2d9d9cbdcd235f907d834'; // API-KEY for open weather map

const createWeatherCard = (cityName,weatherItem,index) => {
    if(index ===0) {  // HTML for the main weather card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem?.dt_txt?.split(" ")[0] || "Date unavailable"})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S </h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </div>
            <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather icon">
                    <h4>${weatherItem.weather[0].description}</h4>
            </div>`;

    } else {
        return `<li class="card">
                    <h2>(${weatherItem?.dt_txt?.split(" ")[0] || "Date unavailable"})</h2>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather icon">
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S </h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
              </li>`;

    }
};

const updateMapLocation = (latitude, longitude) => {
    map.setView([latitude, longitude], 10); // Center the map at the given coordinates and set zoom level
    L.marker([latitude, longitude]).addTo(map); // Add a marker at the location
};


const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.list || !Array.isArray(data.list)) {
                return alert("Unexpected response from the weather API!");
            }

            // Clear previous weather cards
            cityInput.value = "";
            weatherCardsDiv.innerHTML = "";
            currentWeatherDiv.innerHTML = "";

            // Filter the forecasts to get only one forecast per day
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            // Clear previous weather data
            cityInput.value = "";
            weatherCardsDiv.innerHTML = "";

            // Create weather cards and add them to the DOM
            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
            });

            // Update the map view with the location's coordinates
            updateMapLocation(lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
};


const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return; 

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
// (latitude, longitude, and name) from the API name
    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {   
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const{ latitude, longitude }= position.coords;
            const REVERSE_GEOCODING_URL=`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;


            // get city name form coordinates using reverse geocoding api
            fetch(REVERSE_GEOCODING_URL)
        .then(res => res.json())
        .then(data => {
            const { name}= data[0];
            getWeatherDetails(name, latitude, longitude);
           
        })
        .catch(() => {
            alert("An error occurred while fetching the city!");
        });
            

        },
        error => {
            if(error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");

            }

        }

    );
}

locationbutton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key ==="Enter" &&getCityCoordinates());



const apiKey = "bb0059cb50f2d9d9cbdcd235f907d834"; // Replace with your OpenWeatherMap API key

        // Initialize the map
        const map = L.map('weatherMap').setView([30.69, 76.85], 10); // Centered at Panchkula

        // Add OpenStreetMap base layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Add OpenWeatherMap temperature layer
        L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${"bb0059cb50f2d9d9cbdcd235f907d834"}`, {
            attribution: '&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>',
            maxZoom: 19,
        }).addTo(map);

        const temperatureLayer = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`);
        const cloudLayer = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`);
        
        L.control.layers({
            'Temperature': temperatureLayer,
            'Clouds': cloudLayer,
        }).addTo(map);
        
        temperatureLayer.addTo(map);

        let currentTime = new Date();
        let layer;
        function updateLayer() {
            if (layer) {
                map.removeLayer(layer);
            }
            const timeParam = Math.floor(currentTime.getTime() / 1000); // Unix timestamp
            layer = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}&time=${timeParam}`);
            layer.addTo(map);
            currentTime.setMinutes(currentTime.getMinutes() + 10); // Move 10 minutes forward
        }
        setInterval(updateLayer, 10000); // Update every 2 seconds
        updateLayer(); // Initial load


                

