let selectedLanguage = "en"
let selectedUnits = "metric"
let lastSearchedCity = ""

document.addEventListener("DOMContentLoaded", async function () {
    await fetchDefaultWeather()
    
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipNode => {
      new bootstrap.Tooltip(tooltipNode)
    })
  })

async function changeLanguage(lang) {
    selectedLanguage = lang;
    await fetchWeatherData(); // Call to re-fetch weather data
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipNode => {
      new bootstrap.Tooltip(tooltipNode)
    })
}

async function changeUnits(units) {
    selectedUnits = units;
    await fetchWeatherData(); // Call to re-fetch weather data'
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipNode => {
      new bootstrap.Tooltip(tooltipNode)
    })
}

async function fetchWeatherData() {
    const city = document.getElementById("city").value; // Get the current city from input

    // Fetch default weather only if no city is searched
    if (!city) {
        await fetchDefaultWeather();
    } else {
        await getWeather(city);
    }
}


async function fetchDefaultWeather() {
    const cities = ["Helsinki", "Lappeenranta", "Jyväskylä", "Rovaniemi", "Paris", "Berlin", "Moscow"]
    const apiKey = "dd684262242773646e93f248d2ffff5b"
  
    const defaultWeatherContainer = document.getElementById("default-weather")
    defaultWeatherContainer.innerHTML = "" // Clear previous content
  
    for (const city of cities) {
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=${selectedLanguage}&units=${selectedUnits}`
      try {
        const response = await fetch(currentWeatherUrl)
        const data = await response.json()
        console.log(data.main.temp)
        displayDefaultWeather(data)
      } catch (error) {
        console.error(`Error fetching weather data for ${city}:`, error)
      }
    }
  }
  
  function displayDefaultWeather(data) {
    const defaultWeatherContainer = document.getElementById("default-weather")
  
    if (data.cod !== 200) return
  
    const cityName = data.name
    const temperature = data.main.temp
    const description = data.weather[0].description
    const iconCode = data.weather[0].icon
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`
  
    const weatherHtml = `
    <div class="col">
        <div class="weather-card">
            <h5>${cityName}</h5>
            <a href="#" class="d-inline-block" data-bs-toggle="tooltip" data-bs-title="${description}">
                <img src="${iconUrl}" alt="Weather Icon" style="max-width: 50px height: auto">
            </a>
            <p>${temperature}°C</p>
        </div>
    </div>
    `
    defaultWeatherContainer.innerHTML += weatherHtml
  }
  
  async function getWeather() {
    
    const apiKey = "dd684262242773646e93f248d2ffff5b"
    const city = document.getElementById("city").value
    if (city === lastSearchedCity) {
      document.querySelector('button[type="submit"]').innerText = "Refresh";
    } else {
      document.querySelector('button[type="submit"]').innerText = "Search";
      lastSearchedCity = city;
    }

    if (!city) {
      alert(selectedLanguage === "en" ? 'Please enter a city' : 'Ole hyvä ja syötä kaupunki')
      return
    }
    
    document.getElementById('default-weather').innerHTML = ''
  
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=${selectedLanguage}&units=${selectedUnits}`
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&lang=${selectedLanguage}&units=${selectedUnits}`
  
    try {
      const weatherResponse = await fetch(currentWeatherUrl)
      const weatherData = await weatherResponse.json()
      displayWeather(weatherData)
    } catch (error) {
      console.error("Error fetching current weather data:", error)
      alert(selectedLanguage === "en" ? 'Error fetching current weather data. Please try again.' : 'Virhe nykyisten sää tietojen hakemisessa. Yritä uudelleen.')
    }
  
    try {
      const forecastResponse = await fetch(forecastUrl)
      const forecastData = await forecastResponse.json()
      displayHourlyForecast(forecastData.list)
    } catch (error) {
      console.error("Error fetching hourly forecast data:", error)
      alert(selectedLanguage === "en" ? 'Error fetching hourly forecast data. Please try again.' : 'Virhe tuntien ennustetietojen hakemisessa. Yritä uudelleen.')
    }
  }
  
  function displayWeather(data) {
    const tempDivInfo = document.getElementById("temp-div")
    const weatherInfoDiv = document.getElementById("weather-info")
    const weatherIcon = document.getElementById("weather-icon")
  
    weatherInfoDiv.innerHTML = ""
    tempDivInfo.innerHTML = ""
  
    if (data.cod === "404") {
      weatherInfoDiv.innerHTML = `<p>${data.message}</p>`
    } else {
      const cityName = data.name
      const temperature = data.main.temp
      const description = data.weather[0].description
      const iconCode = data.weather[0].icon
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`
  
      const temperatureHTML = `
          <p>${temperature}°C</p>
      `
  
      const weatherHtml = `
          <p>${cityName}</p>
          <a href="#" class="d-inline-block" data-bs-toggle="tooltip" data-bs-title="${description}">
              <img src="${iconUrl}" alt="Weather Icon" style="max-width: 50px height: auto">
          </a>
      `


      document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipNode => {
        new bootstrap.Tooltip(tooltipNode)
      })
  
      tempDivInfo.innerHTML = temperatureHTML
      weatherInfoDiv.innerHTML = weatherHtml
      weatherIcon.src = iconUrl
      weatherIcon.alt = description

      tempDivInfo.classList.add("flash");
      weatherInfoDiv.classList.add("flash");

      setTimeout(() => {
          tempDivInfo.classList.remove("flash");
          weatherInfoDiv.classList.remove("flash");
      }, 500);

    }
  }
  
  function displayHourlyForecast(hourlyData) {

    let hourlyColums = document.getElementById("hourly-colums")
    hourlyColums.innerHTML = ""
  
    const next24Hours = hourlyData.slice(2, 15) // Split the 24h forecase in parts of 15
  
    next24Hours.forEach(item => {
      const dateTime = new Date(item.dt * 1000)
      const hour = dateTime.getHours()
      const temperature = Math.round(item.main.temp - 273.15)
      const iconCode = item.weather[0].icon
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`
      const description = item.weather[0].description
  
      const hourlyItemHtml = `
          <div class="col">
              <div class="hourly-item">
                  <span>${hour}:00</span>
                  <a href="#" class="d-inline-block" data-bs-toggle="tooltip" data-bs-title="${description}">
                    <img src="${iconUrl}" alt="Weather Icon" style="max-width: 50px height: auto">
                  </a>
                  <span>${temperature}°C</span>
              </div>
          </div>
      `
      
      
      hourlyColums.innerHTML += hourlyItemHtml

      document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipNode => {
        new bootstrap.Tooltip(tooltipNode)
      })
      
    })

    hourlyColums.classList.add("flash");
    setTimeout(() => {
      hourlyColums.classList.remove("flash");
    }, 500);

  }

  const locationButton = document.getElementById("get-location-btn");
  locationButton.addEventListener("click", async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                }

                console.log(`Latitude: ${pos.lat}, Longitude: ${pos.lng}`)
                const city = await getCityName(pos.lat, pos.lng); // Get city name
                document.getElementById("city").value = city; // Set city value in input
                if (city === lastSearchedCity) {
                  document.querySelector('button[type="submit"]').innerText = "Refresh";
                } else {
                  document.querySelector('button[type="submit"]').innerText = "Search";
                  lastSearchedCity = city;
                }
                await getWeather(); // Call getWeather without any arguments
            },
            () => {
                console.error("Error: The Geolocation service failed.")
            }
        )
    } else {
        console.error("Error: Your browser doesn't support geolocation.")
    }
})

function handleLocationError(browserHasGeolocation) {
  console.log(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );

}

async function getCityName(lat, lng) {
  const apiKey = "dd684262242773646e93f248d2ffff5b";
  const reverseGeocodeUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&lang=${selectedLanguage}`;

  try {
      const response = await fetch(reverseGeocodeUrl);
      const data = await response.json();
      const city = data.name;
      console.log(`City: ${city}`);
      return city
  } catch (error) {
      console.error("Error fetching city name:", error);
  }
}