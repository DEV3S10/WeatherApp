const content = document.getElementById("content");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const themeBtn = document.getElementById("themeBtn");

themeBtn.onclick = () => {
  document.body.dataset.theme =
      document.body.dataset.theme === "dark" ? "" : "dark";
};

searchBtn.onclick = () => {
  const city = document.getElementById("cityInput").value;
  if (city) getCity(city);
};

geoBtn.onclick = () => {
  navigator.geolocation.getCurrentPosition(
      pos => getWeather(pos.coords.latitude, pos.coords.longitude),
      () => showError("Geolocation denied")
  );
};

async function getCity(city) {
  try {
    const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );
    const data = await res.json();
    if (!data.results) throw "error";
    const { latitude, longitude, name } = data.results[0];
    getWeather(latitude, longitude, name);
  } catch {
    showError("City not found");
  }
}

async function getWeather(lat, lon, city = "") {
  try {
    const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
    );
    const data = await res.json();
    render(data, city);
  } catch {
    showError("No internet");
  }
}

function render(data, city) {
  content.innerHTML = `
    <div class="card">
      <h2>${city}</h2>
      <h1>${data.current.temperature_2m}°C</h1>
      <p>Feels like ${data.current.apparent_temperature}°C</p>
      <p>Humidity: ${data.current.relative_humidity_2m}%</p>
      <p>Pressure: ${data.current.pressure_msl} hPa</p>
      <p>Wind: ${data.current.wind_speed_10m} km/h</p>
    </div>

    <div class="card">
      <h3>Hourly forecast</h3>
      <div class="hourly">
        ${data.hourly.time.slice(0, 24).map((time, i) => `
          <div class="hour-item">
            <span>${time.split("T")[1]}</span>
            <strong>${data.hourly.temperature_2m[i]}°</strong>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="card">
      <h3>7 day forecast</h3>
      <div class="days">
        ${data.daily.time.map((day, i) => `
          <div class="day-item">
            <span>${day}</span>
            <strong>
              ${data.daily.temperature_2m_max[i]}° /
              ${data.daily.temperature_2m_min[i]}°
            </strong>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function showError(text) {
  content.innerHTML = `<p>${text}</p>`;
}
