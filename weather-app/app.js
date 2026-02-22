const CITIES = [
    { name: "北京", nameEn: "Beijing", country: "中国", lat: 39.9042, lon: 116.4074 },
    { name: "上海", nameEn: "Shanghai", country: "中国", lat: 31.2304, lon: 121.4737 },
    { name: "东京", nameEn: "Tokyo", country: "日本", lat: 35.6762, lon: 139.6503 },
    { name: "纽约", nameEn: "New York", country: "美国", lat: 40.7128, lon: -74.0060 },
    { name: "伦敦", nameEn: "London", country: "英国", lat: 51.5074, lon: -0.1278 },
    { name: "巴黎", nameEn: "Paris", country: "法国", lat: 48.8566, lon: 2.3522 },
    { name: "悉尼", nameEn: "Sydney", country: "澳大利亚", lat: -33.8688, lon: 151.2093 },
    { name: "迪拜", nameEn: "Dubai", country: "阿联酋", lat: 25.2048, lon: 55.2708 },
    { name: "新加坡", nameEn: "Singapore", country: "新加坡", lat: 1.3521, lon: 103.8198 },
    { name: "莫斯科", nameEn: "Moscow", country: "俄罗斯", lat: 55.7558, lon: 37.6173 },
];

// WMO Weather interpretation codes mapping
const WEATHER_CODES = {
    0: { desc: "晴", icon: "☀️" },
    1: { desc: "大部晴朗", icon: "🌤️" },
    2: { desc: "多云", icon: "⛅" },
    3: { desc: "阴天", icon: "☁️" },
    45: { desc: "雾", icon: "🌫️" },
    48: { desc: "雾凇", icon: "🌫️" },
    51: { desc: "小毛毛雨", icon: "🌦️" },
    53: { desc: "毛毛雨", icon: "🌦️" },
    55: { desc: "大毛毛雨", icon: "🌦️" },
    56: { desc: "冻毛毛雨", icon: "🌧️" },
    57: { desc: "冻雨", icon: "🌧️" },
    61: { desc: "小雨", icon: "🌧️" },
    63: { desc: "中雨", icon: "🌧️" },
    65: { desc: "大雨", icon: "🌧️" },
    66: { desc: "小冻雨", icon: "🌧️" },
    67: { desc: "大冻雨", icon: "🌧️" },
    71: { desc: "小雪", icon: "🌨️" },
    73: { desc: "中雪", icon: "🌨️" },
    75: { desc: "大雪", icon: "❄️" },
    77: { desc: "雪粒", icon: "❄️" },
    80: { desc: "阵雨", icon: "🌦️" },
    81: { desc: "中阵雨", icon: "🌧️" },
    82: { desc: "大阵雨", icon: "🌧️" },
    85: { desc: "小阵雪", icon: "🌨️" },
    86: { desc: "大阵雪", icon: "❄️" },
    95: { desc: "雷暴", icon: "⛈️" },
    96: { desc: "雷暴伴小冰雹", icon: "⛈️" },
    99: { desc: "雷暴伴大冰雹", icon: "⛈️" },
};

function getWeatherInfo(code) {
    return WEATHER_CODES[code] || { desc: "未知", icon: "❓" };
}

function getWindDirection(degrees) {
    const directions = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

function createLoadingCard(city) {
    return `
        <div class="weather-card loading" id="card-${city.nameEn}">
            <span>加载 ${city.name} 天气中...</span>
        </div>
    `;
}

function createWeatherCard(city, data) {
    const current = data.current;
    const weatherInfo = getWeatherInfo(current.weather_code);
    const windDir = getWindDirection(current.wind_direction_10m);

    return `
        <div class="weather-card" id="card-${city.nameEn}">
            <div class="card-header">
                <div class="city-info">
                    <h2>${city.name}</h2>
                    <span class="country">${city.nameEn}, ${city.country}</span>
                </div>
                <div class="weather-icon">${weatherInfo.icon}</div>
            </div>
            <div class="temperature">${Math.round(current.temperature_2m)}°C</div>
            <div class="weather-desc">${weatherInfo.desc} · 体感 ${Math.round(current.apparent_temperature)}°C</div>
            <div class="weather-details">
                <div class="detail-item">
                    <span class="detail-label">湿度</span>
                    <span class="detail-value">${current.relative_humidity_2m}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">风速</span>
                    <span class="detail-value">${windDir} ${current.wind_speed_10m} km/h</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">气压</span>
                    <span class="detail-value">${current.surface_pressure} hPa</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">降水</span>
                    <span class="detail-value">${current.precipitation} mm</span>
                </div>
            </div>
        </div>
    `;
}

function createErrorCard(city, error) {
    return `
        <div class="weather-card error" id="card-${city.nameEn}">
            <div class="card-header">
                <div class="city-info">
                    <h2>${city.name}</h2>
                    <span class="country">${city.nameEn}, ${city.country}</span>
                </div>
                <div class="weather-icon">⚠️</div>
            </div>
            <div class="weather-desc">无法获取天气数据</div>
        </div>
    `;
}

async function fetchWeather(city) {
    const params = new URLSearchParams({
        latitude: city.lat,
        longitude: city.lon,
        current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "weather_code",
            "surface_pressure",
            "wind_speed_10m",
            "wind_direction_10m",
        ].join(","),
        timezone: "auto",
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

async function fetchAllWeather() {
    const grid = document.getElementById("weather-grid");
    const timeEl = document.getElementById("update-time");

    // Show loading state
    grid.innerHTML = CITIES.map(createLoadingCard).join("");

    // Fetch all cities in parallel
    const results = await Promise.allSettled(
        CITIES.map((city) => fetchWeather(city))
    );

    // Render results
    grid.innerHTML = results
        .map((result, index) => {
            const city = CITIES[index];
            if (result.status === "fulfilled") {
                return createWeatherCard(city, result.value);
            }
            return createErrorCard(city, result.reason);
        })
        .join("");

    // Update timestamp
    const now = new Date();
    const timeStr = now.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
    timeEl.textContent = `最后更新: ${timeStr}`;
}

// Initial load
fetchAllWeather();
