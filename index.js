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

let selectedOption = 'Today'

const month = {
    1:'Jan',
    2:'Feb',
    3:'Mar',
    4:'Apr',
    5:'May',
    6:'Jun',
    7:'Jul',
    8:'Aug',
    9:'Sep',
    10:'Oct',
    11:'Nov',
    12:'Dec'
    }

document.addEventListener('DOMContentLoaded', async (event) => {
    try {
        const coordinates = await getLocation();
        console.log(coordinates[0], coordinates[1]);
        // fetch (`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coordinates[0]}&longitude=${coordinates[1]}&localityLanguage=en`)
        // fetch (`https://api.opencagedata.com/geocode/v1/json?key=c3ae13d3bc664fe585db1e679751d31c&q=${coordinates[0]}%2C${coordinates[1]}&pretty=1`)
        // fetch ('https://api.opencagedata.com/geocode/v1/json?key=c3ae13d3bc664fe585db1e679751d31c&q=40.7052011%2C-74.0141173&pretty=1')
        // fetch (`https://geocode.xyz/${coordinates[0]},${coordinates[1]}?geoit=json&auth=111478610472165251572x86843`)
        fetch (`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordinates[0]}&lon=${coordinates[1]}`)
        .then (response => response.json())
        .then (data => {
            console.log (data)
            //console.log(data.results[0].components.city)
            console.log (data.address.city)
            let cityTown;
            if (data.address.city != undefined) {
                cityTown = data.address.city
            } else if (data.address.town != undefined) {
                cityTown = data.address.town
            }

            creatingWeatherPanel(cityTown)
            initAutocomplete();

            const searchIcon = document.getElementById('search-icon');
            searchIcon.addEventListener('click', function(event) {
                event.preventDefault();
                creatingWeatherPanel(document.getElementById("autocomplete-input").value.split(',')[0])
                updateCityList(document.getElementById("autocomplete-input").value)
              });

            const displayCityWeather = document.querySelector("form#display-city");
            displayCityWeather.addEventListener("submit", (event) => {
                event.preventDefault();
                creatingWeatherPanel(event.target['city-name'].value.split(',')[0])
                updateCityList(document.getElementById("autocomplete-input").value)
            })

            const tomorrowWeather = document.querySelector('button#Tomorrow');
            tomorrowWeather.addEventListener ('click', (event) => displayWeatherTomorrow (document.querySelector('p#pLocation').textContent.split(',')[0]))

            const todayWeather = document.querySelector('button#Today')
            todayWeather.addEventListener ('click', (event) => creatingWeatherPanel (document.querySelector('p#pLocation').textContent.split(',')[0]))

            const sevenDays = document.querySelector('button#sevenDays')
            sevenDays.addEventListener ('click', (event) => sevenDayForecast(document.querySelector('p#pLocation').textContent.split(',')[0]));

            customCityLoad();
            
            const historyHeading = document.getElementById('history');
            const cityList = document.getElementById('city-list');
            cityList.setAttribute('hidden', 'hidden');
            
            let isCityListHidden = true;
            
            historyHeading.addEventListener('click', () => {
              if (!isCityListHidden) {
                cityList.setAttribute('hidden', 'hidden');
                isCityListHidden = true;
              } else {
                cityList.removeAttribute('hidden');
                isCityListHidden = false;
              }
            });

            //change numbers according to current selected system
            const toggleUnitCheckbox = document.getElementById('toggle-unit');
            toggleUnitCheckbox.addEventListener('change', () => {
                const isChecked = toggleUnitCheckbox.checked;
                console.log(isChecked);
                convertSystem (isChecked);
                // const hourForecastDivs = document.querySelectorAll('div.hour-forecast');
                // const hourForecastDivsArray = Array.from(hourForecastDivs);
                const divs = document.querySelectorAll('div.hour-forecast');
                const pTagsWithTemp = [];
                
                divs.forEach(div => {
                  const pTags = div.querySelectorAll('p');
                  pTags.forEach(p => {
                    if (p.textContent.includes('Temp')) {
                      pTagsWithTemp.push(p);
                    }
                  });
                });
                for (let i = 0; i < pTagsWithTemp.length; i++) {
                    if (isChecked) {
                        pTagsWithTemp[i].textContent = `Temp: ${((+pTagsWithTemp[i].textContent.split(' ')[1] * 9/5)+ 32).toFixed(1)} °F`
                    } else {
                        pTagsWithTemp[i].textContent = `Temp: ${((+pTagsWithTemp[i].textContent.split(' ')[1] -32) * 5/9).toFixed(1)} °C`
                    }
                }
                console.log(pTagsWithTemp)
                if (selectedOption === 'Tomorrow') {
                    document.querySelector("p#pTemperature").innerHTML = ''
                }
            })
        })
        .catch (error => alert(error.message))
    } catch (error) {
        console.error(error);
    }
})

function customCityLoad () {
    fetch ('http://localhost:3000/city')
    .then (response =>response.json())
    .then (city => city.forEach(city => {
            const cityList = document.querySelector('ul#city-list');
            const cityAdded = document.createElement('li');
            cityAdded.textContent = city.city
            cityList.appendChild(cityAdded);         
        }))
}

function updateCityList (city) {
    event.preventDefault();
    const cityList = document.querySelector('ul#city-list');
    const cityName = document.createElement('li');
    cityName.textContent = city;
    cityList.appendChild(cityName);
    const cityObj = {city:city}
    fetch (`http://localhost:3000/city`, {
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Accept":"application/json"
        },
        body: JSON.stringify(cityObj)
    })
    .then (response => response.json())
    .then (cities =>  {
        console.log('DONE')
    })
}

function houreForecastArr(data) {
    let localTimeHoure = data.location.localtime.split(' ')[1].split(':')[0];
    console.log (+localTimeHoure);
    
    //collect next 24 houre weather forecast
    const forecastData = [ ];
    //console.log (data.forecast.forecastday[0].hour[16].time)
    let j = 0;
    const toggleUnitCheckbox = document.getElementById('toggle-unit').checked;
    let temp = 'temp_c';
    if (toggleUnitCheckbox) {
        temp = 'temp_f'
    }

    for (let i = +localTimeHoure + 1; i < +localTimeHoure + 25; i++) {
        if (i < 24) {
            const houreItem = {
                time: data.forecast.forecastday[0].hour[i].time.split(' ')[1],
                temp_c: data.forecast.forecastday[0].hour[i][temp],
                img: data.forecast.forecastday[0].hour[i].condition.icon,
                weatherCondition: data.forecast.forecastday[0].hour[i].condition.text
            }
            forecastData.push(houreItem)
        } else {
            const houreItemNextDay = {
                time: data.forecast.forecastday[1].hour[j].time.split(' ')[1],
                temp_c: data.forecast.forecastday[1].hour[j][temp],
                img: data.forecast.forecastday[1].hour[j].condition.icon,
                weatherCondition: data.forecast.forecastday[1].hour[j].condition.text
            }
            forecastData.push(houreItemNextDay)
            j++
        }       
    }
    return forecastData;
}

function createHourlyForecastElements(forecastData) {
    //console.log(div)
    const hourForecast = document.getElementById('hour-forecast');
    hourForecast.style.display = '';
    hourForecast.style.justifyContent = '';

    const forecastContainer = document.querySelector(`div#hour-forecast`)
    forecastContainer.innerHTML = ''
    
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
    const toggleUnitCheckbox = document.getElementById('toggle-unit').checked;
    let t = "°C"
    if (toggleUnitCheckbox) {
        t = "°F"
    }

    forecastData.forEach((hour) => {
        const hourDiv = document.createElement('div');
        hourDiv.classList.add('hour-forecast');

        const time = document.createElement('p');
        time.textContent = `Time: ${hour.time}`;
        hourDiv.appendChild(time);

        const temperature = document.createElement('p');
        console.log (hour.temp_c)
        temperature.textContent = `Temp: ${hour.temp_c} ${t}`;
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

function deleteContentInsideDiv(divId) {
    const div = document.getElementById(divId);
    const form = div.querySelector('form');
  
    // Remove child nodes except for the form element
    Array.from(div.childNodes).forEach((node) => {
      if (node !== form) {
        div.removeChild(node);
      }
    });
}

function creatingWeatherPanel (city) {
    //event.preventDefault();
    selectedOption = 'Today'
    console.log(city);
    const URL = `http://api.weatherapi.com/v1/forecast.json?key=476fc45bade541f8988153529230506&q=${city}&days=7&aqi=no&alerts=no`
    fetch (URL)
    .then (response => response.json())
    .then (data => {
        //creating current location weather panel
        const weatherDiv = document.querySelector("div#weather-info");
        //weatherDiv.innerHTML = ''
        deleteContentInsideDiv('weather-info');
        const toggleUnitCheckbox = document.getElementById('toggle-unit').checked;

        const location = document.createElement('p');
        location.textContent = `${data.location.name}, ${data.location.region}, ${data.location.country}.`;
        location.classList.add('city-name');
        location.id = 'pLocation'
        weatherDiv.appendChild(location);

        const currentTime = document.createElement('p');
        const currentTimeStr = `${data.location.localtime}`;
 
        currentTime.textContent = `${month[+currentTimeStr.split('-')[1]]} ${currentTimeStr.split('-')[2].slice(0,2)} ${currentTimeStr.split(' ')[1]}`
        currentTime.id = 'pCurrentTime'
        currentTime.classList.add('temp-range');
        weatherDiv.appendChild(currentTime);
        
        const weatherIconTemp = document.createElement('div');
        weatherIconTemp.classList.add('weather-icon-temp');
        
        const weatherImg = document.createElement('img');
        const img = data.current.condition.icon.slice(2);
        weatherImg.src = `http://${img}`;
        weatherImg.id = 'weatherImg'
        weatherIconTemp.appendChild(weatherImg);
        
        const tempC = document.createElement('p');
        if (!toggleUnitCheckbox) {
            tempC.textContent = `${data.current.temp_c} °C`;
        } else {
            tempC.textContent = `${data.current.temp_f} °F`;
        }
        tempC.classList.add('temperature');
        tempC.id = 'pTemperature'
        weatherIconTemp.appendChild(tempC);
        
        weatherDiv.appendChild(weatherIconTemp);
        
        const weatherCondition = document.createElement('p');
        weatherCondition.textContent = data.current.condition.text;
        weatherCondition.classList.add('weather-condition');
        weatherCondition.id = 'pWeatherCondition'
        weatherDiv.appendChild(weatherCondition);
        
        const tempMinMax = document.createElement('p');
        if (!toggleUnitCheckbox) {
            tempMinMax.textContent = `H: ${data.forecast.forecastday[0].day.maxtemp_c} °C | L: ${data.forecast.forecastday[0].day.mintemp_c} °C`;
        } else {
            tempMinMax.textContent = `H: ${data.forecast.forecastday[0].day.maxtemp_f} °F | L: ${data.forecast.forecastday[0].day.mintemp_f} °F`;
        }
        tempMinMax.classList.add('temp-range');
        tempMinMax.id = 'pTempRange'
        weatherDiv.appendChild(tempMinMax);
        
        const windInfo = document.createElement('p');
        if (!toggleUnitCheckbox) {
            windInfo.textContent = `Wind: ${data.current.wind_kph} Kph ${data.current.wind_dir}`;
        } else {
            windInfo.textContent = `Wind: ${data.current.wind_mph} Mph ${data.current.wind_dir}`;
        }
        windInfo.classList.add('wind-info');
        windInfo.id = 'pWindInfo'
        weatherDiv.appendChild(windInfo);

        const forecastData = houreForecastArr(data);
        createHourlyForecastElements(forecastData);
    })
}

function initAutocomplete() {
    const input = document.getElementById('autocomplete-input');
  
    // Create the autocomplete object
    const autocomplete = new google.maps.places.Autocomplete(input);
  
    // Optional: Set additional options for the autocomplete
    // For example, to restrict the search to a specific country:
    // autocomplete.setComponentRestrictions({ country: 'us' });
  
    // Optional: Attach event listener for when a place is selected
    autocomplete.addListener('place_changed', onPlaceSelected);
}
  
function onPlaceSelected() {
    const place = this.getPlace();
    // Access the selected place object and perform further actions
    console.log(place);
}
  
// Call the initAutocomplete function when the page finishes loading

function displayWeatherTomorrow (city) {
    //event.preventDefault();
    selectedOption = 'Tomorrow'
    console.log(city);
    event.preventDefault();
    const URL = `http://api.weatherapi.com/v1/forecast.json?key=476fc45bade541f8988153529230506&q=${city}&days=7&aqi=no&alerts=no`
    fetch (URL)
    .then (response => response.json())
    .then (data => {
        const toggleUnitCheckbox = document.getElementById('toggle-unit').checked;
        //console.log (toggleUnitCheckbox.checked)
        const currentTime = document.querySelector('p#pCurrentTime');
        const currentTimeStr = `${data.forecast.forecastday[1].date}`;
        currentTime.textContent = `${month[+currentTimeStr.split('-')[1]]} ${currentTimeStr.split('-')[2].slice(0,2)}`

        const weatherImg = document.querySelector('img#weatherImg');
        weatherImg.src = `http://${data.forecast.forecastday[1].day.condition.icon.slice(2)}`

        const tempC = document.querySelector('p#pTemperature');
        tempC.textContent = ''
        
        const weatherCondition = document.querySelector('p#pWeatherCondition');
        weatherCondition.textContent = data.forecast.forecastday[1].day.condition.text;
        
        const tempMinMax = document.querySelector('p#pTempRange');
        const windInfo = document.querySelector('p#pWindInfo');

        if (!toggleUnitCheckbox) {
            tempMinMax.textContent = `H: ${data.forecast.forecastday[1].day.maxtemp_c} °C | L: ${data.forecast.forecastday[1].day.mintemp_c} °C`;
            windInfo.textContent = `Wind: ${data.forecast.forecastday[1].day.maxwind_kph} kph`;
        } else {
            tempMinMax.textContent = `H: ${data.forecast.forecastday[1].day.maxtemp_f} °F | L: ${data.forecast.forecastday[1].day.mintemp_f} °F`;
            windInfo.textContent = `Wind: ${data.forecast.forecastday[1].day.maxwind_mph} mph`;           
        }
        //windInfo.textContent = `Wind: ${data.forecast.forecastday[1].day.maxwind_kph} kph`;

        //display hourly forecast for tomorrow
        let temp = 'temp_c';
        if (toggleUnitCheckbox) {
            temp = 'temp_f'
        }
        let hourlyForecastTomorrow = []
        for (let i = 0; i < 24; i++) {
            const houreItem = {
                time: data.forecast.forecastday[1].hour[i].time.split(' ')[1],
                temp_c: data.forecast.forecastday[1].hour[i][temp],
                img: data.forecast.forecastday[1].hour[i].condition.icon,
                weatherCondition: data.forecast.forecastday[1].hour[i].condition.text
            }
            hourlyForecastTomorrow.push(houreItem)
        }
        createHourlyForecastElements(hourlyForecastTomorrow);
    })
}

function sevenDayForecast (city) {
    event.preventDefault();
    const URL = `http://api.weatherapi.com/v1/forecast.json?key=476fc45bade541f8988153529230506&q=${city}&days=7&aqi=no&alerts=no`
    fetch (URL)
    .then (response => response.json())
    .then (data => {
        let sevenDayArr = []
        for (let i=0;i<7;i++) {
            const dayObj = {
                time: `${month[+data.forecast.forecastday[i].date.split('-')[1]]} ${data.forecast.forecastday[i].date.split('-')[2]}`,
                temp_c: data.forecast.forecastday[i].day.maxtemp_c +'°C | '+data.forecast.forecastday[i].day.mintemp_c,
                img: `${data.forecast.forecastday[i].day.condition.icon}`,
                weatherCondition: data.forecast.forecastday[i].day.condition.text
            }
            sevenDayArr.push (dayObj)
            console.log(dayObj)
        }
        createHourlyForecastElements(sevenDayArr);

        const hourForecast = document.getElementById('hour-forecast');

        // CSS styles to center the element
        hourForecast.style.display = 'flex';
        hourForecast.style.justifyContent = 'center';
    })
}


function convertSystem (isChecked) {
    if (isChecked) {
        document.querySelector('p#pTemperature').textContent = (((+document.querySelector('p#pTemperature').textContent.split(' ')[0] * 9/5) + 32).toFixed(1)) + ' °F';
        const h = `H: ${((+document.querySelector('p#pTempRange').textContent.split(' ')[1] * 9/5) + 32).toFixed(1)} °F`
        const l = `L: ${((+document.querySelector('p#pTempRange').textContent.split(' ')[5] * 9/5) + 32).toFixed(1)} °F`
        document.querySelector('p#pTempRange').textContent = `${h} | ${l}`
        // 3.6 kph SSW
        if (document.querySelector('p#pWindInfo').textContent.split(' ')[3] !== undefined) {
            document.querySelector('p#pWindInfo').textContent = `Wind: ${(+document.querySelector('p#pWindInfo').textContent.split(' ')[1] * 0.62137119).toFixed(1)} mph ${document.querySelector('p#pWindInfo').textContent.split(' ')[3]}`
        } else {
            document.querySelector('p#pWindInfo').textContent = `Wind: ${(+document.querySelector('p#pWindInfo').textContent.split(' ')[1] * 0.62137119).toFixed(1)} mph`
        }

    } else {
        console.log (document.querySelector('p#pTemperature').textContent)
        document.querySelector('p#pTemperature').textContent = (((+document.querySelector('p#pTemperature').textContent.split(' ')[0] - 32) * 5/9).toFixed(1)) + ' °C';
        const h = `H: ${((+document.querySelector('p#pTempRange').textContent.split(' ')[1] -32) * 5/9).toFixed(1)} °C`
        const l = `L: ${((+document.querySelector('p#pTempRange').textContent.split(' ')[5] -32) * 5/9).toFixed(1)} °C`
        document.querySelector('p#pTempRange').textContent = `${h} | ${l}`
        console.log (document.querySelector('p#pWindInfo').textContent)
        
        if (document.querySelector('p#pWindInfo').textContent.split(' ')[3] !== undefined) {
            document.querySelector('p#pWindInfo').textContent = `Wind: ${(+document.querySelector('p#pWindInfo').textContent.split(' ')[1] * 1.609344).toFixed(1)} kph ${document.querySelector('p#pWindInfo').textContent.split(' ')[3]}`
        } else {
            document.querySelector('p#pWindInfo').textContent = `Wind: ${(+document.querySelector('p#pWindInfo').textContent.split(' ')[1] * 1.609344).toFixed(1)} kph`
        }
    }
}