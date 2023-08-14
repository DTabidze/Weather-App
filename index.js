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

function initAutocomplete() {
    const input = document.getElementById('autocomplete-input');
  
    // Create the autocomplete object
    const autocomplete = new google.maps.places.Autocomplete(input);
  
    // Optional: Attach event listener for when a place is selected
    autocomplete.addListener('place_changed', onPlaceSelected);
}
  
function onPlaceSelected() {
    const place = this.getPlace();
    // Access the selected place object and perform further actions
    console.log(place);
}
  
// Call the initAutocomplete function when the page finishes loading

// main code

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
        fetch (`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordinates[0]}&lon=${coordinates[1]}`)
        .then (response => response.json())
        .then (data => {
            let cityTown;
            if (data.address.city != undefined) {
                cityTown = data.address.city
            } else if (data.address.town != undefined) {
                cityTown = data.address.town
            }

            // after getting location and name of a place, we creating weather panel using name of a place(our current location)
            creatingWeatherPanel(cityTown)
            // call google maps address autocomplete function
            initAutocomplete();
            // adding event listeners on search button for both click and submit options
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
            //display tomorrow's weather
            const tomorrowWeather = document.querySelector('button#Tomorrow');
            tomorrowWeather.addEventListener ('click', (event) => displayWeatherTomorrow (document.querySelector('p#pLocation').textContent.split(',')[0]))
            // display today's weather
            const todayWeather = document.querySelector('button#Today')
            todayWeather.addEventListener ('click', (event) => creatingWeatherPanel (document.querySelector('p#pLocation').textContent.split(',')[0]))
            // display 7 day forecast
            const sevenDays = document.querySelector('button#sevenDays')
            sevenDays.addEventListener ('click', (event) => sevenDayForecast(document.querySelector('p#pLocation').textContent.split(',')[0]));
            // load search history and hide it, till u click button to show
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

            //change numbers according to current selected system, using checkbox and create even listener if its checked or not
            const toggleUnitCheckbox = document.getElementById('toggle-unit');
            toggleUnitCheckbox.addEventListener('change', () => {
                const isChecked = toggleUnitCheckbox.checked;
                convertSystem (isChecked);
                const divs = document.querySelectorAll('div.hour-forecast');
                const pTagsWithTemp = [];
                // select every p tag inside hourly forecast div, which contains string Temp, to convert em according to checkbox
                divs.forEach(div => {
                  const pTags = div.querySelectorAll('p');
                  pTags.forEach(p => {
                    if (p.textContent.includes('Temp')) {
                      pTagsWithTemp.push(p);
                    }
                  });
                });

                for (let i = 0; i < pTagsWithTemp.length; i++) {
                    let h = +pTagsWithTemp[i].textContent.split(' ')[1]
                    let l = pTagsWithTemp[i].textContent.split(' ')[4]
                    if (l === undefined) {
                        pTagsWithTemp[i].textContent = (`Temp: ${convertorCF(h,isChecked)}`)
                    } else {
                        pTagsWithTemp[i].textContent = (`Temp: ${convertorCF(h,isChecked)} | ${convertorCF(+l,isChecked)}`)
                    }
                }
                //if we select tomorrow's weather forecas we should clean current temp
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

function houreForecastArr(data) {
    let localTimeHoure = data.location.localtime.split(' ')[1].split(':')[0];
    
    //collect next 24 houre weather forecast into forecastData array
    const forecastData = [ ];
    let j = 0;
    const toggleUnitCheckbox = document.getElementById('toggle-unit').checked;
    let temp = 'temp_c';
    if (toggleUnitCheckbox) {
        temp = 'temp_f'
    }
    // we start from current time + 1 and grabing next 24 hour data. when day changes we just grab data from next object of forecastday[] and return the array
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
//creating 24hour forecast panel using forecastData array. and make whole div sectin to slide left and right using mouse ...
function createHourlyForecastElements(forecastData) {
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
    // pageX is a property of the mousemove event object (e in the code snippet). 
    // It represents the horizontal coordinate of the mouse pointer relative to the whole document, measured in pixels from the left edge.
    // offsetLeft is a property of an element in the DOM. 
    // It represents the distance between the left edge of the element and the left edge of its offset parent 
    // (the nearest ancestor element that has a position other than static).
    forecastContainer.addEventListener('mousemove', (e) => {
        if (!isMouseDown) 
            return;
        e.preventDefault();
        const x = e.pageX - forecastContainer.offsetLeft; // get horisontan position of the mouse
        const distance = (x - startX) * 2; // sliding sensitivity adjustment, distance mouse has moved
        forecastContainer.scrollLeft = scrollLeft - distance;
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
    const URL = `http://api.weatherapi.com/v1/forecast.json?key={YOUR_API_KEY}=${city}&days=7&aqi=no&alerts=no`
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


function displayWeatherTomorrow (city) {
    //event.preventDefault();
    //fetching live weather data for tomorrow forecast. 
    selectedOption = 'Tomorrow'
    event.preventDefault();
    const URL = `http://api.weatherapi.com/v1/forecast.json?key={YOUR_API_KEY}=${city}&days=7&aqi=no&alerts=no`
    fetch (URL)
    .then (response => response.json())
    .then (data => {
        const toggleUnitCheckbox = document.getElementById('toggle-unit').checked;
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
// fetch 7 days live forecast
function sevenDayForecast (city) {
    event.preventDefault();
    const toggleUnitCheckbox = document.getElementById('toggle-unit').checked;
    let hT = 'maxtemp_c'
    let lT = 'mintemp_c'
    let tempDegree = ' °C | '
    if (toggleUnitCheckbox) {
        hT = 'maxtemp_f'
        lT = 'mintemp_f'
        tempDegree = ' °F | '
    }
    const URL = `http://api.weatherapi.com/v1/forecast.json?key={YOUR_API_KEY}=${city}&days=7&aqi=no&alerts=no`
    fetch (URL)
    .then (response => response.json())
    .then (data => {
        let sevenDayArr = []
        for (let i=0;i<7;i++) {
            const dayObj = {
                time: `${month[+data.forecast.forecastday[i].date.split('-')[1]]} ${data.forecast.forecastday[i].date.split('-')[2]}`,
                temp_c: data.forecast.forecastday[i].day[hT] +tempDegree+data.forecast.forecastday[i].day[lT],
                img: `${data.forecast.forecastday[i].day.condition.icon}`,
                weatherCondition: data.forecast.forecastday[i].day.condition.text
            }
            sevenDayArr.push (dayObj)
        }
        createHourlyForecastElements(sevenDayArr);

        const hourForecast = document.getElementById('hour-forecast');

        // CSS styles to center the element
        hourForecast.style.display = 'flex';
        hourForecast.style.justifyContent = 'center';
    })
}

// celcius to farenheit and vice versa
function convertorCF (number, isChecked) {
    if (isChecked) {
        return ((number * 9/5) + 32).toFixed(1) + ' °F'
    } else {
        return ((number - 32) * 5/9).toFixed(1) + ' °C'
    }
}
// kph to mph and vice versa
function convertorKphMph (number, isChecked) {
    if (isChecked) {
        return ((number * 0.62137119).toFixed(1) + ' mph')
    } else {
        return ((number * 1.609344).toFixed(1) + ' kph')
    }
}

//convert temp and wind speed when we check or uncheck system box
function convertSystem (isChecked) {
    document.querySelector('p#pTemperature').textContent = convertorCF(+document.querySelector('p#pTemperature').textContent.split(' ')[0],isChecked)
    const h = 'H: ' + convertorCF(+document.querySelector('p#pTempRange').textContent.split(' ')[1],isChecked)
    const l = 'L: ' + convertorCF(+document.querySelector('p#pTempRange').textContent.split(' ')[5],isChecked)
    document.querySelector('p#pTempRange').textContent = `${h} | ${l}`
    const windSpeed = +document.querySelector('p#pWindInfo').textContent.split(' ')[1]
    const windDirection = document.querySelector('p#pWindInfo').textContent.split(' ')[3]
    if (windDirection !== undefined) {
        document.querySelector('p#pWindInfo').textContent = `Wind: ${convertorKphMph(windSpeed,isChecked)} ${windDirection}`
    } else {
        document.querySelector('p#pWindInfo').textContent = `Wind: ${convertorKphMph(windSpeed,isChecked)}`
    }
}

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
