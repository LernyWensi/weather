"use strict";(()=>{var l=(n,t={})=>new URL(`${n.origin}${n.pathname}?${new URLSearchParams([...Array.from(n.searchParams.entries()),...Object.entries(t)])}`),b=new URL("https://geocoding-api.open-meteo.com/v1/search?language=en&format=json&count=10"),v=async n=>{try{return(await fetch(l(b,{name:n})).then(e=>e.json()).then(e=>e.results)).map(e=>({name:e.name,country:e.country||"None",latitude:e.latitude,longitude:e.longitude,adminArea:e.admin1||"None"}))}catch(t){return new Error(`Failed to fetch city with name ${n||"<empty>"}
${t}`)}},w=new URL("https://api.open-meteo.com/v1/forecast?current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,snowfall,wind_speed_10m,wind_direction_10m,wind_gusts_10m"),h=async(n,t)=>{try{let e=await fetch(l(w,{latitude:n.toString(),longitude:t.toString()})).then(s=>s.json()).then(({current:s,current_units:p})=>({current:s,current_units:p})),i=s=>({isDay:s.is_day,precipitation:s.precipitation,rain:s.rain,snowfall:s.snowfall,relativeHumidity:s.relative_humidity_2m,temperature:{factual:s.temperature_2m,apparent:s.apparent_temperature},wind:{speed:s.wind_speed_10m,direction:s.wind_direction_10m,gusts:s.wind_gusts_10m}});return{weather:i(e.current),units:i(e.current_units)}}catch(e){return new Error(`Failed to fetch city with latitude: ${n} and longitude: ${t}'
${e}`)}};var u=(n,t)=>{if(!n)throw new Error(t)},d=(n,t,e=document)=>{let i=e.querySelector(n);return u(i instanceof t,`Selector "${n}" didn't match any elements`),i},y=(n,t,e=document)=>{let i=e.querySelectorAll(n);return Array.from(i).filter(s=>s instanceof t)};window.DEVELOPMENT&&new EventSource("/esbuild").addEventListener("change",()=>location.reload());var a={form:d("#city-form",HTMLFormElement),input:d("#city-input",HTMLInputElement),autocmp:d("#city-autocmp",HTMLMenuElement),output:d("#city-weather",HTMLOutputElement)};a.form.addEventListener("submit",async n=>{n.preventDefault();let t=a.autocmp.querySelector(".selected");if(t===null)return;let{name:e,country:i,adminarea:s,longitude:p,latitude:c}=t.dataset;u(e&&i&&s&&p&&c,"Some value is missing in the dataset of autocompletion element"),a.autocmp.innerHTML="",a.autocmp.dataset.selected="0",a.form.reset(),a.output.innerHTML=`
        <div>
            <div class="block">
                <span>Loading...</span>
                <span>\u{1F4A4}</span>
            </div>
        </div>
    `;let m=await h(Number(c),Number(p));if(m instanceof Error){a.output.innerHTML=`
            <div>
                <div class="block">
                    <span>Something went wrong</span>
                    <span>\u{1F613}</span>
                </div>
            </div>
        `;return}let{weather:r,units:o}=m;a.output.innerHTML=`
        <div>
            <div class="block title">
                <span>City</span>
                <span>${r.isDay?"\u{1F31E}":"\u{1F31A}"}</span>
            </div>

            <div class="block city">
                <span>${e}</span>
                <span>${i} \u2022 ${s}</span>
            </div>
            <div class="block">
                <span>Lon & Lat</span>
                <span>${p}\xB0 | ${c}\xB0</span>
            </div>
        </div>
        <div>
            <div class="block title">
                <span>Temperature</span>
                <span>\u{1F321}\uFE0F</span>
            </div>

            <div class="block">
                <span>Factual</span>
                <span>${r.temperature.factual}${o.temperature.factual}</span>
            </div>

            <div class="block">
                <span>Apparent</span>
                <span>${r.temperature.apparent}${o.temperature.apparent}</span>
            </div>
        </div>
        <div>
            <div class="block title">
                <span>Wind</span>
                <span>\u{1F343}</span>
            </div>

            <div class="block">
                <span>Speed</span>
                <span>${r.wind.speed}${o.wind.speed}</span>
            </div>

            <div class="block">
                <span>Direction</span>
                <span>${r.wind.direction}${o.wind.direction}</span>
            </div>

            <div class="block">
                <span>Gusts</span>
                <span>${r.wind.gusts}${o.wind.gusts}</span>
            </div>
        </div>
        <div>
            <div class="block title">
                <span>Precipitation</span>
                <span>\u{1F4A7}</span>
            </div>

            <div class="block">
                <span>Precipitation</span>
                <span>${r.precipitation}${o.precipitation}</span>
            </div>

            <div class="block">
                <span>Rain</span>
                <span>${r.rain}${o.rain}</span>
            </div>

            <div class="block">
                <span>Relative humidity</span>
                <span>${r.relativeHumidity}${o.relativeHumidity}</span>
            </div>

            <div class="block">
                <span>Snowfall</span>
                <span>${r.snowfall}${o.snowfall}</span>
            </div>
        </div>
    `});a.input.addEventListener("keydown",n=>{if(n.key==="ArrowDown"||n.key==="ArrowUp"){n.preventDefault();let t=Number(a.autocmp.dataset.selected);u(!Number.isNaN(t),'Search output should has "data-selected" attribute'),t=Math.min(a.autocmp.children.length-1,Math.max(0,Number(t)+(n.key==="ArrowDown"?-1:1))),a.autocmp.children[t].classList.add("selected"),[...a.autocmp.children].forEach((e,i)=>{e.classList.remove("selected"),i===t&&(e.scrollIntoView({behavior:"smooth"}),e.classList.add("selected"))}),a.autocmp.dataset.selected=t.toString()}else if(n.key==="Enter"){let t=Number(a.autocmp.dataset.selected);u(!Number.isNaN(t),'Search output should has "data-selected" attribute'),d("button",HTMLButtonElement,a.autocmp.children[t]).focus()}});a.input.addEventListener("input",async()=>{let n=await v(a.input.value);if(a.autocmp.innerHTML="",n instanceof Error)return;n.forEach((e,i)=>{a.autocmp.insertAdjacentHTML("beforeend",`
                <li 
                    data-name="${e.name}"
                    data-country="${e.country}"
                    data-adminArea="${e.adminArea}"
                    data-longitude="${e.longitude.toFixed(2)}"
                    data-latitude="${e.latitude.toFixed(2)}"
                    ${i===0?'class="selected"':""}
                >
                    <button type="submit">
                        <div>
                            <span>${e.name}</span>
                        </div>
                        <div>
                            <span>Country</span>
                            <span>${e.country}</span>
                        </div>
                        <div>
                            <span>Administration</span>
                            <span>${e.adminArea}</span>
                        </div>
                        <div>
                            <span>Lon & Lat</span>
                            <span>${e.longitude.toFixed(2)}\xB0 | ${e.latitude.toFixed(2)}\xB0</span>
                        </div>
                    </button>  
                </li>
            `)});let t=y("li",HTMLLIElement,a.autocmp);t.forEach(e=>{d("button",HTMLButtonElement,e).addEventListener("click",()=>{t.forEach(i=>void i.classList.remove("selected")),e.classList.add("selected")})}),a.autocmp.scrollTo(0,0)});})();
