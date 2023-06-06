//weather project
//get coordinates , had to use promise async to wait .bcs it takes some time to get coordinates
function getLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    resolve([latitude, longitude]);
                },
                (error) => {
                    reject(error);
                }
            );
        } else {
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
}

document.addEventListener('DOMContentLoaded', async (event) => {
    // fetch("https://api.ipify.org?format=json")
    // .then(response => response.json())
    // .then(data => {
    //     const ipAddress = data.ip;
    //     console.log("IP:", ipAddress);
    //     fetch (`https://ipinfo.io/${ipAddress}/json?`)
    //     .then (response =>response.json())
    //     .then (data => currentLocationWeather(data.city))
    // })
    // .catch(error => {
    //     console.log("Error occurred while fetching IP address:", error);
    // });
    try {
        const coordinates = await getLocation();
        console.log(coordinates[0], coordinates[1]);
        //fetch (`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coordinates[0]}&longitude=${coordinates[1]}&localityLanguage=en`)
        fetch (`https://geocode.xyz/${coordinates[0]},${coordinates[1]}?geoit=json&auth=111478610472165251572x86843`)
        .then (response => response.json())
        .then (data => {
            console.log(data)
            currentLocationWeather(data.city)
        })
        .catch (error => alarm(error.message))
    } catch (error) {
        console.error(error);
    }
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
        //creating current location weather panel
        const weatherDiv = document.querySelector('div#weather-info');
        
        const location = document.createElement('p');
        location.setAttribute('id', 'location');
        location.textContent = `${data.location.name}, ${data.location.region}, ${data.location.country}.`;
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
        const forecastData = houreForecastArr(data);
        createHourlyForecastElements(forecastData,'hour-forecast');

        //Load Custom City List
        fetch ('http://localhost:3000/city')
        .then (response =>response.json())
        .then (city => city.forEach(city => {
                const cityList = document.querySelector('ul#city-list')
                const cityAdded = document.createElement('li');
                cityAdded.textContent = city.city
                cityList.appendChild(cityAdded);
                cityAdded.addEventListener('click', (event) => displayCustomCityWeather(event.target.textContent))           
            }))

        //add custom city in JSON DB
        const addCity = document.querySelector("form#add-city");
        addCity.addEventListener("submit", (event) => updateCityList(event))
        function updateCityList (event) {
            event.preventDefault();
            const cityList = event.target.previousElementSibling;
            const city = document.createElement('li');
            city.textContent = event.target['city-name'].value;
            cityList.appendChild(city);
            const cityObj = {city:city.textContent}
            fetch (`http://localhost:3000/city`, {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Accept":"application/json"
                },
                body: JSON.stringify(cityObj)
            })
            .then (response => response.json())
            .then (cities =>  event.target['city-name'].value = '')
        }

})
}

function houreForecastArr(data) {
    let localTimeHoure = data.location.localtime.split(' ')[1].split(':')[0];
    console.log (+localTimeHoure);
    
    //console.log (data.forecast.forecastday[0].hour[1])
    //collect next 24 houre weather forecast
    const forecastData = [ ];
    //console.log (data.forecast.forecastday[0].hour[16].time)
    let j = 0;
    for (let i = +localTimeHoure + 1; i < +localTimeHoure + 25; i++) {
        if (i < 24) {
            const houreItem = {
                time: data.forecast.forecastday[0].hour[i].time.split(' ')[1],
                temp_c: data.forecast.forecastday[0].hour[i].temp_c,
                img: data.forecast.forecastday[0].hour[i].condition.icon,
                weatherCondition: data.forecast.forecastday[0].hour[i].condition.text
            }
            forecastData.push(houreItem)
        } else {
            const houreItemNextDay = {
                time: data.forecast.forecastday[1].hour[j].time.split(' ')[1],
                temp_c: data.forecast.forecastday[1].hour[j].temp_c,
                img: data.forecast.forecastday[1].hour[j].condition.icon,
                weatherCondition: data.forecast.forecastday[1].hour[j].condition.text
            }
            forecastData.push(houreItemNextDay)
            j++
        }       
    }
    return forecastData;
}

function createHourlyForecastElements(forecastData,div) {
    console.log(div)
    const forecastContainer = document.querySelector(`div#${div}`)
    
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
    forecastData.forEach((hour) => {
        const hourDiv = document.createElement('div');
        hourDiv.classList.add('hour-forecast');
        //hourDiv.style.marginLeft = 'auto'
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

        const weatherTxt = document.createElement('p')
        weatherTxt.textContent = `${hour.weatherCondition}`
        hourDiv.appendChild(weatherTxt)

        forecastContainer.appendChild(hourDiv);
    });
}

//display selected city weather. creating whole div panel

function displayCustomCityWeather (city) {
    //const URL = `http://api.weatherapi.com/v1/current.json?key=476fc45bade541f8988153529230506&q=${city}&aqi=no`
    const URL = `http://api.weatherapi.com/v1/forecast.json?key=476fc45bade541f8988153529230506&q=${city}&days=7&aqi=no&alerts=no`
    console.log(city);
    fetch (URL)
    .then (response => response.json())
    .then (data => {
        //creating current location weather panel
        const weatherDiv = document.querySelector('div#weather-info-custom');
        weatherDiv.innerHTML = ''

        const hWeather = document.querySelector('div#hour-forecast-custom');
        hWeather.innerHTML = ''
        
        const location = document.createElement('p');
        location.setAttribute('id', 'location-custom');
        location.textContent = `${data.location.name}, ${data.location.region}, ${data.location.country}.`;
        location.classList.add('city-name');
        weatherDiv.appendChild(location);

        const currentTime = document.createElement('p');
        currentTime.setAttribute('id', 'current-time-custom');
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
        tempC.setAttribute('id', 'temp-c-custom');
        tempC.textContent = `${data.current.temp_c} °C`;
        tempC.classList.add('temperature');
        weatherIconTemp.appendChild(tempC);
        
        weatherDiv.appendChild(weatherIconTemp);
        
        const weatherCondition = document.createElement('p');
        weatherCondition.setAttribute('id', 'weather-condition-custom');
        weatherCondition.textContent = data.current.condition.text;
        weatherCondition.classList.add('weather-condition');
        weatherDiv.appendChild(weatherCondition);
        
        const tempMinMax = document.createElement('p');
        tempMinMax.setAttribute('id', 'temp-min-max-custom');
        tempMinMax.textContent = `H: ${data.forecast.forecastday[0].day.maxtemp_c} °C | L: ${data.forecast.forecastday[0].day.mintemp_c} °C`;
        tempMinMax.classList.add('temp-range');
        weatherDiv.appendChild(tempMinMax);
        
        const windInfo = document.createElement('p');
        windInfo.setAttribute('id', 'wind-info-custom');
        windInfo.textContent = `Wind: ${data.current.wind_kph} kph ${data.current.wind_dir}`;
        windInfo.classList.add('wind-info');
        weatherDiv.appendChild(windInfo);

        const forecastData = houreForecastArr(data);
        createHourlyForecastElements(forecastData,'hour-forecast-custom');
    })
}

