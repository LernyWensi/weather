// Check if window.DEVELOPMENT is set to true to enable live reloading.
// This variable is defined via he esbuild.config.mjs file.
// For more details, see the documentation: https://esbuild.github.io/api/#live-reload.
if ((<any>window).DEVELOPMENT) {
    new EventSource('/esbuild').addEventListener('change', () => location.reload());
}

import { fetchCities, fetchWeather } from './fetch';
import { $, $$, assert } from './utils';

const Search = {
    form: $('#city-form', HTMLFormElement),
    input: $('#city-input', HTMLInputElement),
    autocmp: $('#city-autocmp', HTMLMenuElement),
    output: $('#city-weather', HTMLOutputElement),
};

Search.form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const selected = Search.autocmp.querySelector<HTMLLIElement>('.selected');

    if (selected === null) return;

    const { name, country, adminarea: adminArea, longitude, latitude } = selected.dataset;

    assert(
        name && country && adminArea && longitude && latitude,
        'Some value is missing in the dataset of autocompletion element',
    );

    Search.autocmp.innerHTML = '';
    Search.autocmp.dataset.selected = '0';
    Search.form.reset();

    Search.output.innerHTML = `
        <div>
            <div class="block">
                <span>Loading...</span>
                <span>💤</span>
            </div>
        </div>
    `;

    const maybeWeather = await fetchWeather(Number(latitude), Number(longitude));

    if (maybeWeather instanceof Error) {
        Search.output.innerHTML = `
            <div>
                <div class="block">
                    <span>Something went wrong</span>
                    <span>😓</span>
                </div>
            </div>
        `;
        return;
    }

    const { weather, units } = maybeWeather;

    Search.output.innerHTML = `
        <div>
            <div class="block title">
                <span>City</span>
                <span>${weather.isDay ? '🌞' : '🌚'}</span>
            </div>

            <div class="block city">
                <span>${name}</span>
                <span>${country} • ${adminArea}</span>
            </div>
            <div class="block">
                <span>Lon & Lat</span>
                <span>${longitude}° | ${latitude}°</span>
            </div>
        </div>
        <div>
            <div class="block title">
                <span>Temperature</span>
                <span>🌡️</span>
            </div>

            <div class="block">
                <span>Factual</span>
                <span>${weather.temperature.factual}${units.temperature.factual}</span>
            </div>

            <div class="block">
                <span>Apparent</span>
                <span>${weather.temperature.apparent}${units.temperature.apparent}</span>
            </div>
        </div>
        <div>
            <div class="block title">
                <span>Wind</span>
                <span>🍃</span>
            </div>

            <div class="block">
                <span>Speed</span>
                <span>${weather.wind.speed}${units.wind.speed}</span>
            </div>

            <div class="block">
                <span>Direction</span>
                <span>${weather.wind.direction}${units.wind.direction}</span>
            </div>

            <div class="block">
                <span>Gusts</span>
                <span>${weather.wind.gusts}${units.wind.gusts}</span>
            </div>
        </div>
        <div>
            <div class="block title">
                <span>Precipitation</span>
                <span>💧</span>
            </div>

            <div class="block">
                <span>Precipitation</span>
                <span>${weather.precipitation}${units.precipitation}</span>
            </div>

            <div class="block">
                <span>Rain</span>
                <span>${weather.rain}${units.rain}</span>
            </div>

            <div class="block">
                <span>Relative humidity</span>
                <span>${weather.relativeHumidity}${units.relativeHumidity}</span>
            </div>

            <div class="block">
                <span>Snowfall</span>
                <span>${weather.snowfall}${units.snowfall}</span>
            </div>
        </div>
    `;
});

Search.input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();

        let selected = Number(Search.autocmp.dataset.selected);

        assert(!Number.isNaN(selected), 'Search output should has "data-selected" attribute');

        selected = Math.min(
            Search.autocmp.children.length - 1,
            Math.max(0, Number(selected) + (e.key === 'ArrowDown' ? -1 : 1)),
        );

        Search.autocmp.children[selected].classList.add('selected');

        [...Search.autocmp.children].forEach((child, index) => {
            child.classList.remove('selected');
            if (index === selected) {
                child.scrollIntoView({ behavior: 'smooth' });
                child.classList.add('selected');
            }
        });

        Search.autocmp.dataset.selected = selected.toString();
    } else if (e.key === 'Enter') {
        const selected = Number(Search.autocmp.dataset.selected);

        assert(!Number.isNaN(selected), 'Search output should has "data-selected" attribute');

        $('button', HTMLButtonElement, Search.autocmp.children[selected]).focus();
    }
});

Search.input.addEventListener('input', async () => {
    const cities = await fetchCities(Search.input.value);

    Search.autocmp.innerHTML = '';

    if (cities instanceof Error) return;

    cities.forEach((city, index) => {
        Search.autocmp.insertAdjacentHTML(
            'beforeend',
            `
                <li 
                    data-name="${city.name}"
                    data-country="${city.country}"
                    data-adminArea="${city.adminArea}"
                    data-longitude="${city.longitude.toFixed(2)}"
                    data-latitude="${city.latitude.toFixed(2)}"
                    ${index === 0 ? 'class="selected"' : ''}
                >
                    <button type="submit">
                        <div>
                            <span>${city.name}</span>
                        </div>
                        <div>
                            <span>Country</span>
                            <span>${city.country}</span>
                        </div>
                        <div>
                            <span>Administration</span>
                            <span>${city.adminArea}</span>
                        </div>
                        <div>
                            <span>Lon & Lat</span>
                            <span>${city.longitude.toFixed(2)}° | ${city.latitude.toFixed(2)}°</span>
                        </div>
                    </button>  
                </li>
            `,
        );
    });

    const items = $$('li', HTMLLIElement, Search.autocmp);

    items.forEach((li) => {
        $('button', HTMLButtonElement, li).addEventListener('click', () => {
            items.forEach((item) => void item.classList.remove('selected'));
            li.classList.add('selected');
        });
    });

    Search.autocmp.scrollTo(0, 0);
});
