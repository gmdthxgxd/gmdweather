// const urlParams = new URLSearchParams(window.location.search);
const lat = localStorage.getItem("lat");
const lon = localStorage.getItem("lon");
const cityName = localStorage.getItem("cityName");
const API_KEY = "69b1cd01cb678889c132b746d11297fd";

const cityNav = document.getElementById('your-city-nav');
cityNav.innerText = cityName;

const weatherIcons = {
    "01d": "./images/svg/sunny.svg#sunny",
    "01n": "./images/svg/sunny.svg#sunny",
    "02d": "./images/svg/day-cloudy.svg#day-cloudy",
    "02n": "./images/svg/day-cloudy.svg#day-cloudy",
    "03d": "./images/svg/cloud.svg#cloud",
    "03n": "./images/svg/cloud.svg#cloud",
    "04d": "./images/svg/cloudy.svg#cloudy",
    "04n": "./images/svg/cloudy.svg#cloudy",
    "09d": "./images/svg/rain.svg#rain",
    "09n": "./images/svg/rain.svg#rain",
    "10d": "./images/svg/day-rain.svg#day-rain",
    "10n": "./images/svg/day-rain.svg#day-rain",
    "11d": "./images/svg/thunderstorm.svg#thunderstorm",
    "11n": "./images/svg/thunderstorm.svg#thunderstorm",
    "13d": "./images/svg/snow.svg#snow",
    "13n": "./images/svg/snow.svg#snow",
    "50d": "./images/svg/fog.svg#fog",
    "50n": "./images/svg/fog.svg#fog"
};

function renderWeatherNow(data, card) {
    const timeText = card.querySelector(".card-time p");
    const dateText = card.querySelector(".card-date p");
    const icon = card.querySelector(".card-mid use");
    const tempText = card.querySelector(".card-temp p");
    const cityLabel = card.querySelector(".card-city p");
    const humidityText = card.querySelector(".card-humidity-text p");
    const windText = card.querySelector(".card-wind-text p");

    const date = new Date();
    const timeString = date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
    const dateString = date.toLocaleDateString('ru-RU', {month: 'long', weekday: 'short', day: 'numeric'});
    timeText.innerText = timeString;
    dateText.innerText = dateString;
    icon.setAttribute('href', weatherIcons[data.weather[0].icon]);
    tempText.innerText = `${data.main.temp.toFixed(1)}°C`;
    cityLabel.innerText = `${data.sys.country}, ${data.name}`;
    humidityText.innerText = `${data.main.humidity}%`;
    windText.innerText = `${data.wind.speed} м/с`
}

// https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}

const fetchWeatherNow = async (lat, lon) => {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=ru&units=metric`;

    const response = await fetch(weatherUrl);
    const data = await response.json();

    const card = document.querySelector(".card");
    renderWeatherNow(data, card);

    console.log(data);
}


fetchWeatherNow(lat, lon);