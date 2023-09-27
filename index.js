/* 

    ---   W E A T H E R    W O R L D   ---

    * @license -> MIT
    * @copyright Sumit_Dhar, Inc. All Rights Reserved.
    * @author Sumit Dhar  < sumitmi.2013@gmail.com > 
    
*/


/*-----------------------------------*\
         --- API key & URL ---
\*-----------------------------------*/

const apiKey = "5b5273524ddd696880c454799c6a4131";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";
const searchHelper = "https://api.teleport.org/api/cities/?search=";

const searchBox = document.querySelector(".search_box");
const searchBtn = document.querySelector(".search_btn");
const suggestions = document.querySelector("#suggestion");



/*-----------------------------------*\
         --- Date & Time ---
\*-----------------------------------*/

/* --- Date --- */ 
function dateInfo(dateTime){
    const day = dateTime.toLocaleDateString('en-EN', {weekday: 'long'});
    const date = dateTime.getDate();
    const month = dateTime.toLocaleDateString('en-EN', {month: 'short'});
    
    return day + " " + date + ", " + month;
}

/* --- Time --- */ 
function setTime(){
    let time = Time(new Date());
    document.querySelector(".time").innerHTML = time.slice(0,7) + " : " + two_places(new Date().getSeconds()) + time.slice(7);

    return;
}

function two_places(hand){
    return hand < 10 ? "0" + hand : hand;
}

function Time(time){
    let hour = two_places(time.getHours());
    let minute = two_places(time.getMinutes());

    if(hour < 12)
        return (hour + " : " + minute + " AM");
    else if(hour === 12)
        return (hour + " : " + minute + " PM");
    else{
        hour = two_places(time.getHours() - 12);
        return (hour + " : " + minute + " PM");
    }             
}



/*-----------------------------------*\
        --- Weather Report ---
\*-----------------------------------*/

async function checkWeather(city){

    if(city.includes(',')){
        city = city.substring(0,city.indexOf(',')) + city.substring(city.lastIndexOf(','));
    }

    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    const forecastResponse = await fetch(forecastApiUrl + city + `&appid=${apiKey}`);

    /* --- Error --- */
    if(response.status === 404 || forecastResponse.status === 404){
        console.log("error");
        const myModal = new bootstrap.Modal('#incorrect_input');
        myModal.show();
    }
    else{
        var data = await response.json();
        var forecastData = await forecastResponse.json();

        document.body.children[0].children[1].style.filter = 'blur(0)';

        /* --- Updating Left content's information --- */
        const weatherIcon = document.querySelector(".weather_icon");
        let index = weatherIcon.src.lastIndexOf("/") + 1;
        weatherIcon.src = weatherIcon.src.slice(0,index) + data.weather[0].main + ".png";

        document.querySelector(".temperature").innerHTML = Math.round(data.main.temp) + '<sup>&deg;C</sup>';
        document.querySelector(".weather_type").innerHTML = data.weather[0].main;
        document.querySelector(".day_month").innerHTML = dateInfo(new Date());
        document.querySelector(".location").innerHTML = data.name + ", " + data.sys.country;

        /* --- 5 Days Forecast --- */
        for(let key=1;key<=5;key++){
            const weatherIcon = document.querySelector(".forecast_icon" + key);
            let index = weatherIcon.src.lastIndexOf("/") + 1;
            weatherIcon.src = weatherIcon.src.slice(0,index) + forecastData.list[key*8 - 1].weather[0].main + ".png";

            document.querySelector('.temperature' + key).innerHTML = Math.round(forecastData.list[key*8 - 1].main.temp) + '<sup>&deg;C</sup>';
            document.querySelector('.day_month' + key).innerHTML = dateInfo(new Date(forecastData.list[key*8 - 1].dt*1000));
        }

        /* --- Updating Right content's information --- */
        setInterval(setTime,1000);

        let sunrise = new Date(data.sys.sunrise*1000);
        document.querySelector(".sunrise").innerHTML = Time(sunrise);

        let sunset = new Date(data.sys.sunset*1000);
        document.querySelector(".sunset").innerHTML = Time(sunset);

        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed.toFixed(1) + " km/h";
        document.querySelector(".pressure").innerHTML = data.main.pressure + " hPa";
        document.querySelector(".visibility").innerHTML = (data.visibility/1000).toFixed(1) + " km";

        /* --- Hourly Forecast --- */
        let card = window.innerWidth < 1200 ? 6 : 5;

        for(let key=1;key<=card;key++){
            const parent = document.querySelector('.weather_icon' + key);
            
            let time = Time(new Date(forecastData.list[key - 1].dt*1000));
            let day = new Date(forecastData.list[key - 1].dt*1000).toLocaleDateString('en-EN', {weekday: 'short'});
            
            parent.children[0].innerHTML = time.substring(0,2) + " " + time.substring(8) + ", " + day;

            let index = parent.children[1].src.lastIndexOf("/") + 1;
            parent.children[1].src = parent.children[1].src.slice(0,index) + forecastData.list[key - 1].weather[0].main + ".png";

            let description = forecastData.list[key - 1].weather[0].description;
            parent.children[2].innerHTML = description.substring(0,1).toUpperCase() + description.substring(1);

            parent.children[3].innerHTML = Math.round(forecastData.list[key - 1].main.temp) + '<sup>&deg;C</sup>';
        }
    }   

    return;
}



/*-----------------------------------*\
        --- Event Listeners ---
\*-----------------------------------*/

/* --- On Click --- */
searchBtn.addEventListener("click", e => {
    if(searchBox.value.trim() !== '')
        checkWeather(searchBox.value);
    suggestions.innerHTML = '';
});

/* --- On Enter Key Down --- */
searchBox.addEventListener("keydown", e => {
    if(e.keyCode === 13 && searchBox.value.trim() !== '')
        checkWeather(searchBox.value);
    suggestions.innerHTML = '';
});

/* --- On Text Input --- */
searchBox.addEventListener('input', async e => {
    if(searchBox.value.trim() === '')
        return;

    const response = await fetch(searchHelper + searchBox.value);
    const data = await response.json();

    suggestions.innerHTML = '';

    let cities = data._embedded['city:search-results'];
    let length = (cities.length > 6) ? 6 : cities.length;

    for(let key=0;key<length;key++){
        let option = document.createElement('option');
        option.value = cities[key].matching_full_name;
        suggestions.appendChild(option);
    }
});



/*-----------------------------------*\
       --- Current Location ---
\*-----------------------------------*/

function success(pos){
    console.log(pos);

    let latitude = pos.coords.latitude;
    let longitude = pos.coords.longitude;
    
    const geoApiURL = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

    fetch(geoApiURL).then(res => res.json()).then(data => {
        checkWeather(data.locality + ", " + data.countryCode).then(e => document.body.children[0].children[1].style.filter = 'blur(0)');
    });

    return;
}

function error(){
    const myModal = new bootstrap.Modal('#location_not_fetched');

    /* --- Fetching nearby location --- */
    fetch('https://api.ipgeolocation.io/getip').then(response =>response.json()).then(data => {
        
        fetch(`http://ip-api.com/json/${data['ip']}`).then(response =>response.json()).then(data => {

            const geoApiURL = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${data.lat}&longitude=${data.lon}&localityLanguage=en`;

            fetch(geoApiURL).then(res => res.json()).then(data => {
                checkWeather(data.city + ", " + data.countryCode).then(e => document.body.children[0].children[1].style.filter = 'blur(0)');
            })
            .catch( err => myModal.show() );
        })
        .catch( err => myModal.show() )
    })
    .catch( err => myModal.show() )
    return;
}

function currentLocation(){
    searchBox.value = '';
    navigator.geolocation.getCurrentPosition(success,error);
    
    return;
}



/*-----------------------------------*\
       --- Darkmode ---
\*-----------------------------------*/

function darkmode(){
    let themeIcon = document.querySelector('.darkmode');

    /* --- Day Time --- */
    themeIcon.classList.toggle('bi-brightness-high-fill');

    /* --- Night Time --- */
    themeIcon.classList.toggle('bi-moon-stars-fill');

    const left = document.querySelectorAll('.left');
    const right = document.querySelectorAll('.right');

    if(themeIcon.classList.contains('bi-moon-stars-fill')){
        document.body.style.background = '#191818';
        document.querySelector('.copyRight').style.color = 'white';

        /* --- Left Content --- */
        for(let key=0;key<left.length;key++){
            left[key].style.background = '#7f7e7ea9';
        }

        /* --- Right Content --- */
        for(let key=0;key<right.length;key++){
            right[key].style.background = '#7f7e7ea9';
        }
    }
    else{
        document.body.style.background = '';
        document.querySelector('.copyRight').style.color = '';

        /* --- Left Content --- */
        for(let key=0;key<left.length;key++){
            left[key].style.background = 'linear-gradient(148deg, rgba(176,184,50,0.8520658263305322) 0%, rgba(102,176,138,0.8884803921568627) 100%)';
        }

        /* --- Right Content --- */
        for(let key=0;key<right.length;key++){
            right[key].style.background = 'linear-gradient(148deg, rgba(176,184,50,0.8520658263305322) 0%, rgba(102,176,138,0.8884803921568627) 100%)';
        }
    }
    return;
}



/*-----------------------------------*\
        --- Online & Offline ---
\*-----------------------------------*/

function Online(){
    document.querySelector('.offline').style.display = 'none';
    document.querySelector('.online').style.display = '';
    
    currentLocation();
    console.log('online');

    return;
}

function Offline(){
    document.querySelector('.online').style.display = 'none';
    document.querySelector('.offline').style.display = '';

    console.log("offline");

    return;
}

if(navigator.onLine){
    Online();
}
else
    Offline();


window.addEventListener('offline', Offline);

window.addEventListener('online', Online);