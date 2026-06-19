const API_KEY = "41b03bf9371443a18f7155425261706";
const BASE_URL = 'https://api.weatherapi.com/v1/current.json?key=41b03bf9371443a18f7155425261706&q=Delhi&aqi=yes';
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const temperature = document.getElementById('temperature');
const currWeather = document.getElementById('currWeather');
const humidity = document.getElementById('humidity');
const feelsLike = document.getElementById('feelsLike');
const weatherIcon = document.getElementById('weatherIcon');
const weatherDescription = document.getElementById('weatherDescription');
const windSpeed = document.getElementById('windSpeed');
const forecastContainer = document.getElementById('forecastContainer');

// Helper function with timeout
const fetchWithTimeout = (url, timeout = REQUEST_TIMEOUT) => {
    return Promise.race([
        fetch(url),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout - API not responding')), timeout)
        )
    ]);
};

const getWeatherIcon = (condition) => {
    const iconMap = {
        'Sunny': '☀️', 'Clear': '🌙', 'Partly cloudy': '⛅', 'Cloudy': '☁️',
        'Overcast': '☁️', 'Mist': '🌫️', 'Patchy rain nearby': '🌧️',
        'Patchy rain possible': '🌦️', 'Patchy light drizzle': '🌧️',
        'Light drizzle': '🌧️', 'Freezing drizzle': '🌧️',
        'Heavy freezing drizzle': '🌧️', 'Patchy light rain': '🌧️',
        'Light rain': '🌧️', 'Moderate rain': '🌧️', 'Heavy rain': '🌧️',
        'Light rain shower': '🌦️', 'Moderate or heavy rain shower': '🌧️',
        'Torrential rain shower': '⛈️', 'Patchy light snow': '❄️',
        'Light snow': '❄️', 'Patchy moderate snow': '❄️', 'Moderate snow': '❄️',
        'Patchy heavy snow': '❄️', 'Heavy snow': '❄️',
        'Light snow showers': '❄️', 'Moderate or heavy snow showers': '❄️',
        'Patchy light snow with thunder': '⛈️', 'Moderate or heavy snow with thunder': '⛈️',
        'Patchy light rain with thunder': '⛈️', 'Moderate or heavy rain with thunder': '⛈️',
        'Thundery outbreaks possible': '⛈️'
    };
    return iconMap[condition] || '🌤️';
};

const getCurrWeather = async (city) => {
    try {
        const response = await fetchWithTimeout(
            `${BASE_URL}/current.json?key=${API_KEY}&q=${city}&aqi=yes`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.current) {
            throw new Error(data.error?.message || 'City not found');
        }
        
        return data;
    } catch (error) {
        throw new Error(`Weather Error: ${error.message}`);
    }
};

const getForecast = async (city) => {
    try {
        const response = await fetchWithTimeout(
            `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=5&aqi=yes`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.forecast) {
            throw new Error(data.error?.message || 'Forecast not found');
        }
        
        return data;
    } catch (error) {
        throw new Error(`Forecast Error: ${error.message}`);
    }
};

const formatDay = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
};

const updateCurrWeather = (data) => {
    const current = data.current;
    const temp = current.temp_c;
    const feels_like = current.feelslike_c;
    const condition = current.condition.text;
    const wind_speed = current.wind_kph;
    const humidityValue = current.humidity;
    
    temperature.textContent = `${Math.round(temp)}°C`;
    weatherDescription.textContent = condition;
    weatherIcon.textContent = getWeatherIcon(condition);
    humidity.textContent = `Humidity: ${humidityValue}%`;
    feelsLike.textContent = `Feels like: ${Math.round(feels_like)}°C`;
    windSpeed.textContent = `Wind Speed: ${Math.round(wind_speed * 0.277)} m/s`;
};

const updateForecast = (data) => {
    const forecastData = data.forecast.forecastday.slice(0, 5);
    let forecastHTML = '';
    
    forecastData.forEach(item => {
        const date = new Date(item.date);
        const day = formatDay(date);
        const condition = item.day.condition.text;
        const temp_max = item.day.maxtemp_c;
        const temp_min = item.day.mintemp_c;
        
        forecastHTML += `
        <div class="forecast-item">
            <div class="forecast-day">${day}</div>
            <div class="forecast-icon">${getWeatherIcon(condition)}</div>
            <div class="forecast-temp">${Math.round(temp_max)}°/${Math.round(temp_min)}°</div>
        </div>`;
    });
    
    forecastContainer.innerHTML = forecastHTML;
};

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

const handleSearch = async () => {
    const city = cityInput.value.trim();
    
    if (!city) {
        alert('Please enter a city name');
        return;
    }
    
    try {
        // Show loading state
        currWeather.innerHTML = '<div style="text-align:center; padding:40px;">Loading...</div>';
        forecastContainer.innerHTML = '';

        const [weatherData, forecastData] = await Promise.all([
            getCurrWeather(city),
            getForecast(city)
        ]);

        updateCurrWeather(weatherData);
        updateForecast(forecastData);
    } catch (error) {
        console.error('Error:', error);
        currWeather.innerHTML = `
         <div style="text-align:center; padding:40px; color:red; font-weight:bold;">
            <p>❌ Error Loading Weather</p>
            <p style="font-size: 14px; margin-top: 10px;">${error.message}</p>
            <p style="font-size: 12px; margin-top: 15px; color: #666;">
                <strong>Troubleshooting:</strong><br>
                • Check your internet connection<br>
                • Verify the city name is correct<br>
                • Try again in a few moments
            </p>
         </div>
         `;
        forecastContainer.innerHTML = '';
    }
};

searchBtn.addEventListener('click', handleSearch);

// Load weather for default city on page load
window.addEventListener('load', () => {
    cityInput.value = "Delhi";
    handleSearch();
});