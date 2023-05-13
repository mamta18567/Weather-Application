const config = {
    CountryUrl : "https://api.countrystatecity.in/v1/countries",
    CountryKey : "Vk81V3piQ0J5Zmx6a2VtcWNyT2thWVM5N3JlemJCQUdmSkV1MHVQVg==",
    weatherUrl : "http://api.openweathermap.org/data/2.5/",
    weatherAPI : "8e7719c7d4fef3cdf30bdcd5f4f0e730"
}
const countriesList = document.querySelector(".select-country");
const statesList = document.querySelector(".select-state");
const citiesList = document.querySelector(".select-city");
const outputBox = document.querySelector(".output-box")

const getCountries = async(fieldName, ...args) =>{
    let apiEndPoint;
    switch(fieldName){
        case "countries":
            apiEndPoint = `${config.CountryUrl}`;
            break;
        case "states":
            apiEndPoint = `${config.CountryUrl}/${args[0]}/states`;
            break;
        case "cities":
            apiEndPoint = `${config.CountryUrl}/${args[0]}/states/${args[1]}/cities`;
            break;
    }
    const response = await fetch(apiEndPoint, {
        headers:{
        "X-CSCAPI-KEY":config.CountryKey,
        }
    });
    if(response.status != 200){
        throw new Error(`Something went wrong! Status Code : ${response.status}`)
    }
    else{
        const countries = await response.json();
        return countries;
    }
}

const getWeather = async(cityName,countryCode,units = "metric") =>{ 
    const apiEndPoint = `${config.weatherUrl}weather?q=${cityName},${countryCode.toLowerCase()}&APPID=${config.weatherAPI}&units=${units}`
    const response = await fetch(apiEndPoint);
    if(response.status != 200){
        throw new Error(`Something went wrong! Status Code : ${response.status}`)
    }
        const weather = await response.json();
        return weather;
}
const temp = (val,units)=>{
    const flag = units == "far" ? "°F" : "°C"
    return `<div class="temp">
    <h5 class="subtitle ${flag}" ${units}>${val.temp} ${flag}</h5>
    <p class="text">Feels like:${val.feels_like} ${flag}</p>
    <p class="text">Max: ${val.temp_max} ${flag}, Min:${val.temp_min} ${flag}</p>
    </div>`
}
const output = (data) => {
    const weatherWidget = `
    <h5>${data.name}, ${data.sys.country} <span class="float-end units"><a href = "#" class = "unitLink active" data-unit = "cel">°C</a> | <a href = "#" class = "unitLink" data-unit = "far">°F</a></span></h5>
    <p>${getDateTime(data.dt)}</p>
    <div class="temp">${temp(data.main)}
    </div>
    ${data.weather.map(weather => 
    `<div class="image">
    <p>${weather.main}</p>
    <img src="https://openweathermap.org/img/wn/${weather.icon}.png"/>
    </div>
    <p> ${weather.description}</p>`
    ).join("\n")}`

    outputBox.innerHTML = weatherWidget;
}

const getDateTime = (unixTimeStamp) =>{
    const milliseconds = unixTimeStamp*1000;
    const dateObject = new Date(milliseconds);
    const options = {
        weekday : "long",
        year : "numeric",
        month : "long",
        day : "numeric"
    }
    const humanDateFormat = dateObject.toLocaleDateString('en-US',options)
    return humanDateFormat;
}

document.addEventListener("DOMContentLoaded",async ()=>{

        const countries = await getCountries("countries");
        let countriesOptionsList = "";
        if(countries){
            countriesOptionsList += `<option value="">Select Country</option>`
            countries.forEach((country)=>{  
                countriesOptionsList += ` <option value="${country.iso2}">${country.name}</option>`
            })
            countriesList.innerHTML = countriesOptionsList;
            console.log(countriesList);
        }

        countriesList.addEventListener("change",async()=>{
            const selectedCountryCode = countriesList.value;
            const states = await getCountries("states", selectedCountryCode);
            let stateOptionsList = ""
            if(states){
                stateOptionsList += `<option value="">Select State</option>`
                states.forEach((state)=>{  
                    stateOptionsList += ` <option value="${state.iso2}">${state.name}</option>`
                })
                statesList.innerHTML = stateOptionsList;
                statesList.disabled = false;
            }
        });

        statesList.addEventListener("change",async()=>{
            const selectedCountryCode = countriesList.value;
            const selectedStateCode = statesList.value;
            const cities = await getCountries("cities", selectedCountryCode,selectedStateCode);
            let citiesOptionsList = ""
            if(cities){
                citiesOptionsList += `<option value="">Select City</option>`
                cities.forEach((city)=>{  
                    citiesOptionsList += ` <option value="${city.name}">${city.name}</option>`
                })
                citiesList.innerHTML = citiesOptionsList;
                citiesList.disabled = false;
            }
        });

        citiesList.addEventListener("change",async ()=>{
            const selectedCountryCode = countriesList.value;
            const selectedCity = citiesList.value;
            const weatherInfo = await getWeather(selectedCity,selectedCountryCode);
            console.log(weatherInfo);
            output(weatherInfo)
        })

        document.addEventListener("click",async (e)=>{
            if(e.target.classList.contains("unitLink")){
                const unitValue = e.target.getAttribute("data-unit");
                const selectedCountryCode = countriesList.value;
                const selectedCity = citiesList.value;
              
                const unitFlag = unitValue == "far" ? "imperial" : "metric";
                const weatherInfo = await getWeather(selectedCity,selectedCountryCode,unitFlag);
                const weatherTemp = temp(weatherInfo.main,unitValue);
                document.querySelector(".temp").innerHTML = weatherTemp;
                document.querySelectorAll(".unitLink").forEach(link=>{
                    link.classList.remove("active");
                })
                e.target.classList.add("active");
            }
        })
        
    });

