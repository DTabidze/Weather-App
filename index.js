//weather project

document.addEventListener('DOMContentLoaded', (event) => {
    fetch("https://api.ipify.org?format=json")
    .then(response => response.json())
    .then(data => {
        const ipAddress = data.ip;
        console.log("IP:", ipAddress);
        fetch (`https://ipinfo.io/${ipAddress}/json?`)
        .then (response =>response.json())
        .then (data => currentLocationWeather(data.city))
    })
    .catch(error => {
        console.log("Error occurred while fetching IP address:", error);
    });
})

function init () {
}

function currentLocationWeather (city) {
    const URL = `http://api.weatherapi.com/v1/current.json?key=476fc45bade541f8988153529230506&q=${city}&aqi=no`
    console.log(city);
    fetch (URL)
    .then (response => response.json())
    .then (data => {
        const weatherDiv = document.querySelector('div#weather-info');

        const hL = document.createElement('h1')
        hL.textContent = 'Current Location'
        weatherDiv.appendChild(hL)
        
        const location = document.createElement('p');
        location.setAttribute('id', 'location');
        location.textContent = `City: ${data.location.name}`;
        weatherDiv.appendChild(location);

        const country = document.createElement('p');
        country.setAttribute('id', 'country');
        country.textContent = `Country: ${data.location.country}`;
        weatherDiv.appendChild(country);

        const coordinates = document.createElement('p');
        coordinates.setAttribute('id', 'coordinates');
        coordinates.textContent = `Coordinates: lat: ${data.location.lat} lon: ${data.location.lon}`;
        weatherDiv.appendChild(coordinates);

        const localtime = document.createElement('p');
        localtime.setAttribute('id', 'localtime');
        localtime.textContent = `Localtime: ${data.location.localtime}`;
        weatherDiv.appendChild(localtime);

        const h = document.createElement('h1')
        h.textContent = 'Current Weather'
        weatherDiv.appendChild(h)

        const tempC = document.createElement('p')
        tempC.setAttribute('id','temp-c')
        tempC.textContent = `Current Temp: ${data.current.temp_c} °C`;
        weatherDiv.appendChild(tempC);
        //console.log (tempC);

        const weatherImg = document.createElement('img')
        const img = data.current.condition.icon.slice(2);
        weatherImg.src = `http://${img}`;
        weatherDiv.append(weatherImg);
        //console.log (weatherImg.src)

        const windSpeed = document.createElement('p')
        windSpeed.setAttribute('id','wind-speed')
        windSpeed.textContent = `Wind Speed: ${data.current.wind_kph} KPH`;
        weatherDiv.appendChild(windSpeed);

        const windDirection = document.createElement('p')
        windDirection.setAttribute('id','wind-direction')
        windDirection.textContent = `Wind Direction: ${data.current.wind_dir}`;
        weatherDiv.appendChild(windDirection);

        const humidity = document.createElement('p')
        humidity.setAttribute('id','wind-direction')
        humidity.textContent = `Humidity: ${data.current.wind_dir} %`;
        weatherDiv.appendChild(humidity);

        console.log(data)})
}

//init()