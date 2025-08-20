const submitCityButton = document.getElementById('submit-city');
const API_KEY = "69b1cd01cb678889c132b746d11297fd";

const submitCity = async () => {
    const cityName = document.getElementById('city-input').value.trim();
    const cityUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    try {
        const response = await fetch(cityUrl);
        const location = await response.json();
        
        if (!location[0]) {
            throw new Error("Город не найден");
        }
        
        const lat = location[0].lat;
        const lon = location[0].lon;

        localStorage.setItem("lat", lat);
        localStorage.setItem("lon", lon);
        localStorage.setItem("cityName", cityName);
        window.location.href = "weatherByDays.html";
        // window.location.href = `weatherByDays.html?lat=${lat}&lon=${lon}&city=${encodeURIComponent(cityName)}`;
    } catch (error) {
        console.error("Ошибка получения города:", error.message);
    }
}

submitCityButton.addEventListener('click', () => submitCity());

if (localStorage.length != 0) {
    document.getElementById("weatherByDaysBtn").setAttribute("href", "weatherByDays.html");
    document.getElementById("weatherNowBtn").setAttribute("href", "weatherNow.html");
    document.getElementById("footer-nav-forecast").setAttribute("href", "weatherByDays.html");
    document.getElementById("footer-nav-onecall").setAttribute("href", "weatherNow.html");
}

