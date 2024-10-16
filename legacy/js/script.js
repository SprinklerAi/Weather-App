let selectedLanguage = "en"
let selectedUnits = "metric"
let unitsLetter = "C°"
let lastSearchedCity = ""
const apiKey = "dd684262242773646e93f248d2ffff5b"
let city
let cities = []
let lat  = ""
let lon = ""



document.addEventListener("DOMContentLoaded", async function () {
    console.log(city)
    await fetchDefaultWeather()

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipNode => {
        new bootstrap.Tooltip(tooltipNode)
    })
})


document.getElementById("search-form").addEventListener("submit", async(event) => {
    event.preventDefault()

    city = document.getElementById("search-button").value.trim()

    if (city) {
        cities = [city]
        getWeather(cities)
    }
})

// These 2 will refresh the info to accomodate setting changes______________________
async function changeLanguage(lang) {
    selectedLanguage = lang
    await fetchWeatherData()
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipNode => {
        new bootstrap.Tooltip(tooltipNode)
    })
}

async function changeUnits(units) {
    selectedUnits = units
    switch (selectedUnits) {
        case "imperial":
            unitsLetter = "F°"
            break;
        case "standard":
            unitsLetter = "K"
            break;
        default:
            unitsLetter = "C°"
    }     
    await fetchWeatherData()
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipNode => {
        new bootstrap.Tooltip(tooltipNode)
    })
}
//___________________________________________________________________________________


async function fetchWeatherData() {
    // Fetch default weather only if no city is searched. In case settings are changed on default page
    if (cities == []) {
        await fetchDefaultWeather()
    } else {
      console.log(cities)
      await getWeather(cities)
    }
}

async function fetchDefaultWeather() {
  cities = ["Helsinki", "Lappeenranta", "Jyväskylä", "Rovaniemi", "Paris", "Berlin"]
  console.log(cities)
  await getWeather(cities)

}

async function getWeather(cities) {
    let weatherDataArray = []
    console.log(selectedUnits)

    for (const city of cities) {
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=${selectedLanguage}&units=${selectedUnits}`

        try {
            const weatherResponse = await fetch(currentWeatherUrl)
            const weatherData = await weatherResponse.json()

            if (weatherData && weatherData.cod !== "404") {
                weatherDataArray.push(weatherData)
                lat = weatherData.coord.lat
                lon = weatherData.coord.lon
            } else {
                console.error(`Error fetching data for ${city}: ${weatherData.message}`)
            }
        } catch (error) {
            console.error(`Error fetching weather data for ${city}:`, error)
        }
    }

    displayWeatherData(weatherDataArray)
}

function displayWeatherData(weatherDataArray) {
    const cityColumns = document.getElementById("city-colums")
    cityColumns.innerHTML = "" // Clear previous data

    weatherDataArray.forEach(data => {
        const cityName = data.name
        const temperature = data.main.temp
        const description = data.weather[0].description
        const iconCode = data.weather[0].icon
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`

        const weatherHtml = `
            <div class="col" style="text-align: center;">
                <div class="weather-card">
                    <h5 style="margin: 5px 0;">${cityName}</h5>
                    <a href="#" class="d-inline-block" data-bs-toggle="tooltip" data-bs-title="${description}">
                        <img src="${iconUrl}" alt="Weather Icon" style="max-width: 25vw; height: auto; margin-bottom: 10px;">
                    </a>
                    <p style="margin: 5px 0;">${temperature}${unitsLetter}</p>
                </div>
            </div>`

        cityColumns.innerHTML += weatherHtml
    })

    // Reinitialize tooltips
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipNode => {
        new bootstrap.Tooltip(tooltipNode)
    })

    if (cities.length === 1) {
        const forecastUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,daily,alerts&appid=${apiKey}&units=${selectedUnits}&lang=${selectedLanguage}`
        fetchHourlyForecast(forecastUrl)
    }

    // Flash effect to let user know data is refreshed
    cityColumns.classList.add("flash")
    setTimeout(() => {
        cityColumns.classList.remove("flash")
    }, 500)
}


async function fetchHourlyForecast(forecastUrl) {
  try {
      const forecastResponse = await fetch(forecastUrl)
      const forecastData = await forecastResponse.json()
      displayHourlyForecast(forecastData.list)
  } catch (error) {
      console.error("Error fetching hourly forecast data:", error)
      alert(selectedLanguage === "en" ? 'Error fetching hourly forecast data. Please try again.' : 'Virhe tuntien ennustetietojen hakemisessa. Yritä uudelleen.')
  }
  console.log(lat)
  console.log(lon)
  console.log(city)
  console.log(forecastUrl)
  console.log(forecastResponse)
}


function displayHourlyForecast(hourlyData) {
    const hourlyColumns = document.getElementById("hourly-colums")
    hourlyColumns.innerHTML = ""

    hourlyData.forEach(item => {
        const dateTime = new Date(item.dt * 1000) // Convert Unix time to JavaScript Date
        const hour = dateTime.getHours()
        const temperature = item.temp
        const iconCode = item.weather[0].icon
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`
        const description = item.weather[0].description
        const feelsLike = item.feels_like
        const windSpeed = item.wind_speed
        const windDeg = item.wind_deg
        const humidity = item.humidity
        const pressure = item.pressure
        const precipitation = item.pop * 100 // Probability of precipitation as percentage

        const hourlyItemHtml = `
            <div class="col-auto">
                <div class="hourly-item">
                    <span>${hour}:00</span>
                    <a href="#" class="d-inline-block" data-bs-toggle="tooltip" data-bs-title="${description}">
                        <img src="${iconUrl}" alt="Weather Icon" style="max-width: 25%; height: auto">
                    </a>
                    <span>${temperature}${unitsLetter}</span>
                    <div>Feels like: ${feelsLike}${unitsLetter}</div>
                    <div>Wind: ${windSpeed} m/s (${windDeg}°)</div>
                    <div>Humidity: ${humidity}%</div>
                    <div>Pressure: ${pressure} hPa</div>
                    <div>Precipitation: ${precipitation}%</div>
                </div>
            </div>
        `

        hourlyColumns.innerHTML += hourlyItemHtml
    })

    // Reinitialize tooltips
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipNode => {
        new bootstrap.Tooltip(tooltipNode)
    })

    // Flash effect to let user know data is refreshed
    hourlyColumns.classList.add("flash")
    setTimeout(() => {
        hourlyColumns.classList.remove("flash")
    }, 500)
}


const locationButton = document.getElementById("get-location-btn")
locationButton.addEventListener("click", async (event) => {
  event.preventDefault()
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                }

                console.log(`Latitude: ${pos.lat}, Longitude: ${pos.lon}`)
                await getCityName(pos.lat, pos.lon)
                cities = [city] // Get city name
                console.log(cities)
                document.getElementById("search-button").value = cities[0] // Set city value in input
                
                if (city === lastSearchedCity) {
                    document.querySelector('button[type="submit"]').innerText = "Refresh"
                } else {
                    document.querySelector('button[type="submit"]').innerText = "Search"
                    lastSearchedCity = city
                }
                console.log(cities)
                await getWeather(cities) // Call getWeather with the city name
            },
            () => {console.error("Error: The Geolocation service failed.")}
        )
    } else {console.error("Error: Your browser doesn't support geolocation.")}
})

async function getCityName(lat, lon) {
    const apiKey = "dd684262242773646e93f248d2ffff5b"
    const reverseGeocodeUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=${selectedLanguage}`

    try {
        const response = await fetch(reverseGeocodeUrl)
        const data = await response.json()
        city = data.name
        console.log(city)
        return city
    } catch (error) {
        console.error("Error fetching city name:", error)
    }
}

