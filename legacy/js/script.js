const apiKey = "dd684262242773646e93f248d2ffff5b"
let selectedLanguage = "en"
let selectedUnits = "metric"
let unitsLetter = "C°"
let lastSearchedCity = ""
let city
let cities = []
let lat  = ""
let lon = ""
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)

const tomorrowDay = tomorrow.toLocaleDateString(
    selectedLanguage === "fi" ? 'fi-FI' : 'en-GB',
    { day: 'numeric' }
)

const tomorrowMonth = tomorrow.toLocaleDateString(
    selectedLanguage === "fi" ? 'fi-FI' : 'en-GB',
    { month: 'short' }
)

document.addEventListener("DOMContentLoaded", async function () {
    console.log(city)
    await fetchDefaultCitiesWeather()
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

    const locationButton = document.getElementById('get-location-btn')
    const tooltipTitle = selectedLanguage === "en" ? "Your location" : "Sinun sijaintisi"

    locationButton.setAttribute('data-bs-title', tooltipTitle)

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
			break
		case "standard":
			unitsLetter = "K"
			break
		default:
			unitsLetter = "C°"
	}     

	await fetchWeatherData()
	document.querySelectorAll("[data-bs-toggle='tooltip']").forEach(tooltipNode => {
		new bootstrap.Tooltip(tooltipNode)
	})
}
//___________________________________________________________________________________

async function fetchWeatherData() {
	// Fetch default weather only if no city is searched. In case settings are changed on default page
	if (cities.length === 0) {
		await fetchDefaultCitiesWeather()
	} else {
		console.log(cities)
		await getWeather(cities)
	}
}

async function fetchDefaultCitiesWeather() {
	cities = ["Helsinki", "Lappeenranta", "Jyväskylä", "Rovaniemi", "Paris", "Berlin"] // 6 best cities of EU for default page
	const hourlyColums = document.getElementById("hourly-colums")
	const dailyColums = document.getElementById("daily-colums")
	hourlyColums.innerHTML = ""
	dailyColums.innerHTML = ""
	await getWeather(cities)
}

async function getWeather(cities) {
	let weatherDataArray = [] // I used array to store city datas here and release them at once, otherwise cities poped up one by one and it was not looking good
	console.log(selectedUnits)

	for (const city of cities) {
		const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=${selectedLanguage}&units=${selectedUnits}`
		try {
			const weatherResponse = await fetch(currentWeatherUrl)
			const weatherData = await weatherResponse.json()

			if (weatherData && weatherData.cod === 200) { // 200 is success code from OpenWeather
				weatherDataArray.push(weatherData)
				lat = weatherData.coord.lat
				lon = weatherData.coord.lon
			} else {
				// City not found
				if (weatherData.cod === "404") {
					alert(selectedLanguage === "en" ? `City "${city}" not found.` : `Kaupunkia "${city}" ei löytynyt.`)
				} else {
					alert(selectedLanguage === "en" ? `Error: ${weatherData.message}` : `Virhe: ${weatherData.message}`)
				}
				console.error(`Error fetching data for ${city}: ${weatherData.message}`)
			}
		} catch (error) {
			console.error(`Error fetching weather data for ${city}:`, error)
		}
	}

    if (cities.length === 1) {
		fetchSearchedCityForecast()
	}

	// Only update the display if have valid weather data
	if (weatherDataArray.length > 0) {
		displayCurrentMainCity(weatherDataArray)
	}
}

function displayCurrentMainCity(weatherDataArray) {
	const cityColumns = document.getElementById("city-colums")
	cityColumns.innerHTML = ""
	let currentTemp = 0

	weatherDataArray.forEach(data => {
		const cityName = data.name
		currentTemp = Math.round(data.main.temp)
		const description = data.weather[0].description
		const iconCode = data.weather[0].icon
		const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`

		const weatherHtml = `
			<div class="col d-flex justify-content-center align-items-center" style="text-align: center;">
				<div class="weather-card" style="max-width: 25vw;">
					<h5 style="margin: 20px 0;">${cityName}</h5>
					<div data-bs-toggle="tooltip" data-bs-title="${description}">
						<img src="${iconUrl}" alt="Weather Icon" style="max-width: 25vw; height: auto; margin: -50px;">
					</div>
					<p style="margin-top: 20px; margin-bottom: 30px;">${currentTemp}${unitsLetter}</p>
				</div>
			</div>
		`
		cityColumns.innerHTML += weatherHtml
	})

	// Set background color based on temperature
	const currentTime = new Date().getHours()
	let gradientColor = ""

	// Change currenttemp based on units to equalise conversion differences
	if (unitsLetter === "F°") {
		currentTemp = (currentTemp - 32) * (5 / 9)
	} else if (unitsLetter === "K") {
		currentTemp = currentTemp - 273.15
	}

	if (currentTemp > 20) {
		gradientColor = "hot"
	} else if (currentTemp >= 15) {
		gradientColor = "mild"
	} else {
		gradientColor = "cold"
	}
	if (currentTime >= 20) {
		gradientColor += " night"
	}

	document.body.className = gradientColor

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

async function fetchSearchedCityForecast() {
	const forecastUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,alerts&appid=${apiKey}&units=${selectedUnits}&lang=${selectedLanguage}`

	try {
		const forecastResponse = await fetch(forecastUrl)
		const forecastData = await forecastResponse.json()

		if (forecastData.cod && forecastData.cod !== 200) {
			// Handle city not found error
			if (forecastData.cod === 404) {
				alert(selectedLanguage === "en" ? "City not found. Please try a different city." : "Kaupunkia ei löytynyt. Yritä toista kaupunkia.")
			} else {
				alert(selectedLanguage === "en" ? `Error: ${forecastData.message}` : `Virhe: ${forecastData.message}`)
			}
			return
		}

		displayHourlyForecast(forecastData.hourly.slice(1, 24))
		displayDailyforecast(forecastData.daily)
	} catch (error) {
		console.error("Error fetching hourly forecast data:", error)
		alert(selectedLanguage === "en" ? 'Error fetching forecast data. Please try again.' : 'Ennustetietojen hakemisessa. Yritä uudelleen.')
	}
}

function displayHourlyForecast(hourlyData) {
	const hourlyColumns = document.getElementById("hourly-colums")
	hourlyColumns.innerHTML = ""
	// Scrollable container for hourly data
	const scrollableContainer = document.createElement("div")
	scrollableContainer.style.display = "flex"
	scrollableContainer.style.overflowX = "auto"
	scrollableContainer.style.whiteSpace = "nowrap"
	scrollableContainer.style.textAlign = "center"
	scrollableContainer.style.alignItems = "flex"

	hourlyData.forEach(item => {
		const dateTime = new Date(item.dt * 1000) // Convert to JS Date
		const hour = dateTime.getHours()
		const temperature = Math.round(item.temp)
		const iconCode = item.weather[0].icon
		const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`
		const description = item.weather[0].description
		const windSpeed = item.wind_speed
		const windDeg = item.wind_deg
		const precipitation = item.pop * 100
		const windArrow = windDirectionArrow(windDeg)

		const hourlyItemHtml = `
			<div class="hourly-item" style="border: 1px solid #ccc; border-radius: 10px; flex-grow: 1; display: inline-block; text-align: center; margin: 0 5px; min-height: 10vw; padding: 5px;">
				<div>${hour}:00</div> 
				<div data-bs-toggle="tooltip" data-bs-title="${description}">
					<img src="${iconUrl}" alt="Weather Icon" style="max-width: 20vw; height: auto; margin: -20px">
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

		if (hour === 0) {
			const todayDiv = `
				<div class="today" style="display: flex; justify-content: left; align-items: center; margin: 0 10px; height: auto;">
					<div style="border: 1px solid #ccc; border-radius: 10px; height: 100%; display: flex; flex-direction: column; padding: 5px; justify-content: center; align-items: flex-start;">
						<h4>${tomorrowDay}</h4>
                        <h4>${tomorrowMonth} →</h4>

					</div>
				</div>
			`
			scrollableContainer.innerHTML += todayDiv
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
		new bootstrap.Tooltip(tooltipNode)
	})

	// Flash effect to let user know data is refreshed
	hourlyColumns.classList.add("flash")
	setTimeout(() => {
		hourlyColumns.classList.remove("flash")
	}, 500)
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

    // Exclude the first day since we show it on main infocard above these
    dailyData.slice(1).forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString(
            selectedLanguage === "fi" ? 'fi-FI' : 'en-GB', 
            { day: 'numeric', month: 'short' }
        )
        const iconCode = day.weather[0].icon
        const description = day.weather[0].description
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`
        const minTemp = Math.round(day.temp.min)
        const maxTemp = Math.round(day.temp.max)
        const dayTemp = Math.round(day.temp.day)
        const rain = day.rain || 0

        const dailyItemHtml = `
            <div class="forecast-item" style="flex-grow: 1; display: inline-block; text-align: center;  margin: 5px; min-height: 10vw; justify-content: center;">
                <h6>${date}</h6>
                <div data-bs-toggle="tooltip" data-bs-title="${description}">
                    <img src="${iconUrl}" alt="Weather Icon" style="max-width: 10vw; height: auto; margin: -30px; margin-bottom: -15px">
                </div>
                <div data-bs-toggle="tooltip" data-bs-title="${minTemp}${unitsLetter} - ${maxTemp}${unitsLetter}">
                    <div>${dayTemp}${unitsLetter}</div>
                </div>
                <p>${rain} mm</p>
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

// Mainly copied from Google's instructions
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
                cities = [city]
                console.log(cities)
                document.getElementById("search-button").value = cities[0]
            
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