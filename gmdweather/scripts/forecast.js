const prevButton = document.getElementById('prev-btn')
const nextButton = document.getElementById('next-btn');
const cards = document.querySelectorAll('.card');

let currentIndex = 0;

function slideCard(nextIndex, direction) {
    const activeCard = document.querySelector('.active');

    if (nextIndex < 0 || nextIndex >= cards.length) {
        activeCard.style.animation = "cardShaking .7s ease-in-out";
        setTimeout(() => {
            activeCard.style.animation = "none"
        }, 700)
        return;
    }

    let currentCard = cards[currentIndex];
    let nextCard = cards[nextIndex];

    currentCard.classList.remove('active');
    currentCard.classList.add(direction === 'right' ? 'to-left' : 'to-right');

    nextCard.classList.remove('to-right', 'to-left');
    nextCard.classList.add('active');

    currentIndex = nextIndex;
}

prevButton.addEventListener('click', () => {
    slideCard(currentIndex - 1, 'left');
});
nextButton.addEventListener('click', () => {
    slideCard(currentIndex + 1, 'right');
});

// http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
// api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}

// const urlParams = new URLSearchParams(window.location.search);

const lat = localStorage.getItem("lat");
const lon = localStorage.getItem("lon");
const cityName = localStorage.getItem("cityName");
const API_KEY = "69b1cd01cb678889c132b746d11297fd";

const cityNav = document.getElementById('your-city-nav');
cityNav.innerText = cityName;

function groupForecast(forecastList, timezoneOffset) {
    const days = {};

    for (entry of forecastList) {
        const date = new Date((entry.dt + timezoneOffset) * 1000);
        const dateKey = date.toISOString().split("T")[0];

        // !days[dateKey] ? days[dateKey] = [] : days[dateKey].push(entry);
        if (!days[dateKey]) days[dateKey] = [];
        days[dateKey].push(entry);
    }
    return days
}
function getNextFullDays(forecastByDay) {
    for (day in forecastByDay) {
        if (forecastByDay[day].length < 4) {
            delete forecastByDay[day];
        } else {
            return {date: Object.keys(forecastByDay), stats: Object.values(forecastByDay)};
        }
    }
    return null;
}
function getTimesOfDay(entries, timezoneOffset) {
    const timesOfDay = {};

    entries.forEach(time => {
        const localDate = new Date((time.dt + timezoneOffset) * 1000);
        const localHours = localDate.getUTCHours();

        if (localHours >= 6 && localHours < 11) {
            timesOfDay.morning = time;
        }
        else if (localHours >= 12 && localHours < 17) {
            timesOfDay.day = time;
        }
        else if (localHours >= 18 && localHours < 23) {
            timesOfDay.evening = time;
        }
        else if (localHours >= 0 && localHours < 6 || localHours === 23) {
            timesOfDay.night = time;
        }
    });
    return timesOfDay;
}

function isTodayLabel(label, nextFullDayDate, timezoneOffset) {
    const todayDate = new Date();
    const dateNow = todayDate.toISOString().split("T")[0];
    const dateTomorrow = new Date(todayDate.getTime() + 86400000);

    const localDate = new Date((nextFullDayDate + timezoneOffset) * 1000);
    const localDateTime = localDate.toISOString().split("T")[0];

    if (dateNow === localDateTime) {
        label.innerText = `сегодня, ${todayDate.toLocaleDateString('ru-RU', {month: 'short', day: 'numeric'})}`;
    } else if (dateTomorrow.toISOString().split("T")[0] === localDateTime) {
        label.innerText = `завтра, ${dateTomorrow.toLocaleDateString('ru-RU', {month: 'short', day: 'numeric'})}`;
    } else {
        label.innerText = `${localDate.toLocaleDateString('ru-RU', {month: 'short', weekday: 'long', day: 'numeric'})}`;
    }
}

function renderWeather(card, timesOfDay, timezoneOffset) {
    const timeMap = {
        "утром": "morning",
        "днем": "day",
        "вечером": "evening",
        "ночью": "night"
    };

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

    const timeTexts = Array.from(card.querySelectorAll(".time .card-text p"));
    const humidityTexts = Array.from(card.querySelectorAll(".humidity .card-text p"));
    
    card.querySelectorAll(".card-temp").forEach(tempCard => {
        const label = tempCard.querySelector('p').textContent.toLowerCase();
        const timeKey = timeMap[label];
        const tempText = tempCard.querySelector(".temp-text p");
        const iconSVG = tempCard.querySelector(".temp-text use");

        if (timeKey && timesOfDay[timeKey]) {
            const data = timesOfDay[timeKey];
            const iconCode = data.weather[0].icon;

            tempText.innerText = `${Math.round(data.main.temp)}°C`;
            iconSVG.setAttribute('href', weatherIcons[iconCode]);

            let hour = String(new Date((data.dt + timezoneOffset) * 1000).getUTCHours());
            if (hour.length === 1) {
                hour = `0${hour}`;
            }
            
            timeTexts.shift().innerText = `${hour}:00`;
            humidityTexts.shift().innerText = `${data.main.humidity}%`;
        } else {
            tempCard.querySelector('p').style.color = "#CCC";
            timeTexts.shift();
            humidityTexts.shift();
        }
    })
}

const fetchWeatherData = async (lat, lon) => {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    const response = await fetch(weatherUrl);
    const data = await response.json();

    const cityTimezone = data.city.timezone;

    const forecastByDay = groupForecast(data.list, cityTimezone);
    const nextFullDays = getNextFullDays(forecastByDay);

    if (nextFullDays) {
        const cards = document.querySelectorAll(".card");

        for (let i = 0; i < cards.length; i++) {
            const timesOfDay = getTimesOfDay(nextFullDays.stats[i], cityTimezone);

            const dateLabel = cards[i].querySelector(".first-header p");
            isTodayLabel(dateLabel, nextFullDays.stats[i][0].dt, cityTimezone);

            renderWeather(cards[i], timesOfDay, cityTimezone);
        }
    }
}
fetchWeatherData(lat, lon);