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
    //const URL = `http://api.weatherapi.com/v1/current.json?key=476fc45bade541f8988153529230506&q=${city}&aqi=no`
    const URL = `http://api.weatherapi.com/v1/forecast.json?key=476fc45bade541f8988153529230506&q=${city}&days=7&aqi=no&alerts=no`
    console.log(city);
    fetch (URL)
    .then (response => response.json())
    .then (data => {
        const weatherDiv = document.querySelector('div#weather-info');

        // const hL = document.createElement('h1');
        // hL.textContent = 'Current Location';
        // hL.classList.add('location-title');
        // weatherDiv.appendChild(hL);
        
        const location = document.createElement('p');
        location.setAttribute('id', 'location');
        location.textContent = `${data.location.name}`;
        location.classList.add('city-name');
        weatherDiv.appendChild(location);

        const currentTime = document.createElement('p');
        currentTime.setAttribute('id', 'current-time');
        currentTime.textContent = `${data.location.localtime}`;
        currentTime.classList.add('temp-range');
        weatherDiv.appendChild(currentTime);
        
        const weatherIconTemp = document.createElement('div');
        weatherIconTemp.classList.add('weather-icon-temp');
        
        const weatherImg = document.createElement('img');
        const img = data.current.condition.icon.slice(2);
        weatherImg.src = `http://${img}`;
        weatherIconTemp.appendChild(weatherImg);
        
        const tempC = document.createElement('p');
        tempC.setAttribute('id', 'temp-c');
        tempC.textContent = `${data.current.temp_c} °C`;
        tempC.classList.add('temperature');
        weatherIconTemp.appendChild(tempC);
        
        weatherDiv.appendChild(weatherIconTemp);
        
        const weatherCondition = document.createElement('p');
        weatherCondition.setAttribute('id', 'weather-condition');
        weatherCondition.textContent = data.current.condition.text;
        weatherCondition.classList.add('weather-condition');
        weatherDiv.appendChild(weatherCondition);
        
        const tempMinMax = document.createElement('p');
        tempMinMax.setAttribute('id', 'temp-min-max');
        tempMinMax.textContent = `H: ${data.forecast.forecastday[0].day.maxtemp_c} °C | L: ${data.forecast.forecastday[0].day.mintemp_c} °C`;
        tempMinMax.classList.add('temp-range');
        weatherDiv.appendChild(tempMinMax);
        
        const windInfo = document.createElement('p');
        windInfo.setAttribute('id', 'wind-info');
        windInfo.textContent = `Wind: ${data.current.wind_kph} kph ${data.current.wind_dir}`;
        windInfo.classList.add('wind-info');
        weatherDiv.appendChild(windInfo);
        
        
        //houre forecast
        let localTimeHoure = data.location.localtime.split(' ')[1].split(':')[0];
        console.log (+localTimeHoure);
        
        //console.log (data.forecast.forecastday[0].hour[1])
        //collect next 24 houre weather forecast
        const forecastData = [ ];
        console.log (data.forecast.forecastday[0].hour[16].time)
        let j = 0;
        for (let i = +localTimeHoure + 1; i < +localTimeHoure + 25; i++) {
            if (i < 24) {
                console.log(i)
                const houreItem = {
                    time: data.forecast.forecastday[0].hour[i].time.split(' ')[1],
                    temp_c: data.forecast.forecastday[0].hour[i].temp_c,
                    img: data.forecast.forecastday[0].hour[i].condition.icon
                }
                forecastData.push(houreItem)
            } else {
                //console.log(i);
                const houreItemNextDay = {
                    time: data.forecast.forecastday[1].hour[j].time.split(' ')[1],
                    temp_c: data.forecast.forecastday[1].hour[j].temp_c,
                    img: data.forecast.forecastday[1].hour[j].condition.icon
                }
                forecastData.push(houreItemNextDay)
                j++
            }
            
        }

        console.log (forecastData)
        const forecastContainer = document.createElement('div');
        forecastContainer.classList.add('hourly-forecast');
        document.body.appendChild(forecastContainer);

        let isMouseDown = false;
        let startX = 0;
        let scrollLeft = 0;

        // handle mouse down event
        forecastContainer.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            startX = e.pageX - forecastContainer.offsetLeft;
            scrollLeft = forecastContainer.scrollLeft;
        });

        // mouse leave event stops slide
        forecastContainer.addEventListener('mouseleave', () => {
            isMouseDown = false;
        });

        // mouse up event stops slide
        forecastContainer.addEventListener('mouseup', () => {
            isMouseDown = false;
        });

        // handle mouse move event
        forecastContainer.addEventListener('mousemove', (e) => {
            if (!isMouseDown) 
                return;
            e.preventDefault();
            const x = e.pageX - forecastContainer.offsetLeft;
            const walk = (x - startX) * 2; // sliding sensitivity adjustment
            forecastContainer.scrollLeft = scrollLeft - walk;
        });

        // create hourly forecast elements
        function createHourlyForecastElements() {
        forecastData.forEach((hour) => {
            const hourDiv = document.createElement('div');
            hourDiv.classList.add('hour-forecast');

            // display houre data
            const time = document.createElement('p');
            time.textContent = `Time: ${hour.time}`;
            hourDiv.appendChild(time);

            const temperature = document.createElement('p');
            temperature.textContent = `Temperature: ${hour.temp_c} °C`;
            hourDiv.appendChild(temperature);

            // might add pics also
            const tempImg = document.createElement('img');
            tempImg.src = `http://${hour.img.slice(2)}`
            hourDiv.appendChild(tempImg);

            forecastContainer.appendChild(hourDiv);
        });
        }

        createHourlyForecastElements();



})


        // const hL = document.createElement('h1')
        // hL.textContent = 'Current Location'
        // weatherDiv.appendChild(hL)
        // hL.classList.add('location-title');
        
        // const location = document.createElement('p');
        // location.setAttribute('id', 'location');
        // location.textContent = `City: ${data.location.name}`;
        // weatherDiv.appendChild(location);

        // const country = document.createElement('p');
        // country.setAttribute('id', 'country');
        // country.textContent = `Country: ${data.location.country}`;
        // weatherDiv.appendChild(country);

        // const coordinates = document.createElement('p');
        // coordinates.setAttribute('id', 'coordinates');
        // coordinates.textContent = `Coordinates: lat: ${data.location.lat} lon: ${data.location.lon}`;
        // weatherDiv.appendChild(coordinates);

        // const localtime = document.createElement('p');
        // localtime.setAttribute('id', 'localtime');
        // localtime.textContent = `Localtime: ${data.location.localtime}`;
        // weatherDiv.appendChild(localtime);

        // const h = document.createElement('h1')
        // h.textContent = 'Current Weather'
        // weatherDiv.appendChild(h)

        // const tempC = document.createElement('p')
        // tempC.setAttribute('id','temp-c')
        // tempC.textContent = `Current Temp: ${data.current.temp_c} °C`;
        // weatherDiv.appendChild(tempC);
        // //console.log (tempC);

        // const weatherImg = document.createElement('img')
        // const img = data.current.condition.icon.slice(2);
        // weatherImg.src = `http://${img}`;
        // weatherImg.classList.add('weather-icon-temp');
        // weatherDiv.append(weatherImg);
        // //console.log (weatherImg.src)

        // const windSpeed = document.createElement('p')
        // windSpeed.setAttribute('id','wind-speed')
        // windSpeed.textContent = `Wind Speed: ${data.current.wind_kph} KPH`;
        // weatherDiv.appendChild(windSpeed);

        // const windDirection = document.createElement('p')
        // windDirection.setAttribute('id','wind-direction')
        // windDirection.textContent = `Wind Direction: ${data.current.wind_dir}`;
        // weatherDiv.appendChild(windDirection);

        // const humidity = document.createElement('p')
        // humidity.setAttribute('id','wind-direction')
        // humidity.textContent = `Humidity: ${data.current.humidity} %`;
        // weatherDiv.appendChild(humidity);

        // console.log(data)})
}

//init()