let selectedLanguage = "en"
let selectedUnits = "metric"
let unitsLetter = "C°"
let lastSearchedCity = ""
const apiKey = "dd684262242773646e93f248d2ffff5b"
let city
let cities = []
let lat  = ""
let lon = ""
const locationButton = document.getElementById("get-location-btn")

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

    const locationButton = document.getElementById('get-location-btn');
    const tooltipTitle = selectedLanguage === "en" ? "Your location" : "Sinun sijaintisi";

    locationButton.setAttribute('data-bs-title', tooltipTitle);

    const tooltip = bootstrap.Tooltip.getInstance(locationButton)
    if (tooltip) {
        tooltip.dispose()
    }

    new bootstrap.Tooltip(locationButton)

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
            <div class="col d-flex justify-content-center align-items-center" style="text-align: center;">
                <div class="weather-card" style="max-width: 25vw;">
                    <h5 style="margin: 5px 0;">${cityName}</h5>
                    <div data-bs-toggle="tooltip" data-bs-title="${description}">
                        <img src="${iconUrl}" alt="Weather Icon" style="max-width: 25vw; height: auto; margin: -50px;">
                    </div>
                    <p style="margin-top: 10px; margin-bottom: 30px;">${temperature}${unitsLetter}</p>
                </div>
            </div>
            `
        cityColumns.innerHTML += weatherHtml
    })

    if (cities.length === 1) {
        fetchForecast()
    }
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        tooltips.forEach(tooltipNode => {
            const tooltip = bootstrap.Tooltip.getInstance(tooltipNode)
            if (tooltip) {
                tooltip.dispose()
            }
    })

    // Reinitialize tooltips
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipNode => {
        new bootstrap.Tooltip(tooltipNode)
    })

    // Flash effect to let user know data is refreshed
    cityColumns.classList.add("flash")
    setTimeout(() => {
        cityColumns.classList.remove("flash")
    }, 500)
}

async function fetchForecast() {
    const forecastUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,alerts&appid=${apiKey}&units=${selectedUnits}&lang=${selectedLanguage}`
    try {
        const forecastResponse = await fetch(forecastUrl)
        const forecastData = await forecastResponse.json()
        displayHourlyForecast(forecastData.hourly.slice(1, 26)) // Correctly access the hourly data for 24 hours
        displayDailyforecast(forecastData.data.daily)
    } catch (error) {
        console.error("Error fetching hourly forecast data:", error)
        alert(selectedLanguage === "en" ? 'Error fetching forecast data. Please try again.' : 'Ennustetietojen hakemisessa. Yritä uudelleen.')
    }
    console.log(lat)
    console.log(lon)
    console.log(city)
    console.log(forecastUrl)
}

function displayDailyforecast(dailyData) {
    const dailyColums = document.getElementById("daily-colums")
    dailyColums.innerHTML = ""

    const scrollableContainer = document.createElement("div")
    scrollableContainer.style.display = "flex" // Use flexbox for layout
    scrollableContainer.style.overflowX = "auto" // Enable horizontal scrolling
    scrollableContainer.style.whiteSpace = "nowrap" // Prevent line breaks
    scrollableContainer.style.textAlign = "center" // Center the items
    scrollableContainer.style.alignItems = "flex-start" // Align items to the top

    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString()
        const iconCode = day.weather[0].icon
        const description = day.weather[0].description // Corrected access to description
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`
        const minTemp = day.temp.min
        const maxTemp = day.temp.max
        const dayTemp = day.temp.day
        const rain = day.rain || 0

        const dailyItemHtml = `
            <div class="forecast-item" style="display: inline-block; text-align: center; margin: 0 10px; min-height: 10vw">
                <h6>${date}</h6>
                <div data-bs-toggle="tooltip" data-bs-title="${description}">
                    <img src="${iconUrl}" alt="Weather Icon" style="max-width: 25vw; height: auto;">
                </div>
                <div data-bs-toggle="tooltip" data-bs-title="Min: ${minTemp}${unitsLetter}, Max: ${maxTemp}${unitsLetter}">
                    <div>${dayTemp}${unitsLetter}</div>
                </div>
                <p>Rain: ${rain} mm</p>
            </div>
        `
        scrollableContainer.innerHTML += dailyItemHtml
    })

    dailyColums.appendChild(scrollableContainer)

    // Reinitialize tooltips
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipNode => {
        const tooltip = bootstrap.Tooltip.getInstance(tooltipNode)
        if (tooltip) {
            tooltip.dispose()
        }
    })

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipNode => {
        new bootstrap.Tooltip(tooltipNode)
    })

    // Flash effect to let user know data is refreshed
    dailyColums.classList.add("flash")
    setTimeout(() => {
        dailyColums.classList.remove("flash")
    }, 500)

    console.log(dailyData)
    console.log(dayTemp)

}


function displayHourlyForecast(hourlyData) {
    const hourlyColumns = document.getElementById("hourly-colums")
    hourlyColumns.innerHTML = ""
    // Create a scrollable container
    const scrollableContainer = document.createElement("div")
    scrollableContainer.style.display = "flex" // Use flexbox for layout
    scrollableContainer.style.overflowX = "auto" // Enable horizontal scrolling
    scrollableContainer.style.whiteSpace = "nowrap" // Prevent line breaks
    scrollableContainer.style.textAlign = "center" // Center the items
    scrollableContainer.style.alignItems = "flex-start" // Align items to the top

// Generate HTML for each hourly item
    hourlyData.forEach(item => {
        const dateTime = new Date(item.dt * 1000) // Convert Unix time to JavaScript Date
        const hour = dateTime.getHours()
        const temperature = item.temp
        const iconCode = item.weather[0].icon
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`
        const description = item.weather[0].description
        const windSpeed = item.wind_speed
        const windDeg = item.wind_deg
        const precipitation = item.pop * 100 // Probability of precipitation as percentage
        const windArrow = windDirectionArrow(windDeg)

        const hourlyItemHtml = `
            <div class="hourly-item" style="display: inline-block; text-align: center; margin: 0 10px; min-height: 10vw">
                <div>${hour}:00</div> 
                <div data-bs-toggle="tooltip" data-bs-title="${description}">
                    <img src="${iconUrl}" alt="Weather Icon" style="max-width: 25vw; height: auto;">
                </div>
                <div>${temperature}${unitsLetter}</div>
                <div data-bs-toggle="tooltip" data-bs-title="Precipitation">
                    <div>${precipitation}%</div>
                </div>
                <div data-bs-toggle="tooltip" data-bs-title="Wind">
                    <div style="font-family: Arial, sans-serif;">${windSpeed} m/s ${windArrow}</div>
                </div>      
            </div>
        `

        if (hour === 23) {
            const nextDayDiv = `
            <div class="" style="display: inline-block; text-align: left; margin: 0 10px; height: auto;">
                <div style="border: 1px solid #ccc; height: 100%; display: flex; flex-direction: column; padding: 5px;">
                    <h4>NEXT</h4>
                    <h4>DAY →</h4>
                </div>
            </div>
            `
            scrollableContainer.innerHTML += nextDayDiv
        }
        scrollableContainer.innerHTML += hourlyItemHtml
        
    })

hourlyColumns.appendChild(scrollableContainer)

    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        tooltips.forEach(tooltipNode => {
            const tooltip = bootstrap.Tooltip.getInstance(tooltipNode)
            if (tooltip) {
                tooltip.dispose()
            }
    })

    // Reinitialize tooltips
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipNode => {
        new bootstrap.Tooltip(tooltipNode);
    });

    // Flash effect to let user know data is refreshed
    hourlyColumns.classList.add("flash");
    setTimeout(() => {
        hourlyColumns.classList.remove("flash");
    }, 500);
}

function windDirectionArrow(degree) {
    if (degree >= 337.5 || degree < 22.5) return '↑'
    if (degree >= 22.5 && degree < 67.5) return '↗'
    if (degree >= 67.5 && degree < 112.5) return '→'
    if (degree >= 112.5 && degree < 157.5) return '↘'
    if (degree >= 157.5 && degree < 202.5) return '↓'
    if (degree >= 202.5 && degree < 247.5) return '↙'
    if (degree >= 247.5 && degree < 292.5) return '←'
    if (degree >= 292.5 && degree < 337.5) return '↖'
}

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
                cities = [city]
                console.log(cities)
                document.getElementById("search-button").value = cities[0]
                
                if (city === lastSearchedCity) {
                    document.querySelector('button[type="submit"]').innerText = "Refresh"
                } else {
                    document.querySelector('button[type="submit"]').innerText = "Search"
                    lastSearchedCity = city
                }
                console.log(cities)
                await getWeather(cities)
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

