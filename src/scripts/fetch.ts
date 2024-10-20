export type { City, Weather };

export { fetchCities, fetchWeather };

const withSearchParams = (url: URL, params: Record<string, string> = {}): URL => {
    return new URL(
        `${url.origin}${url.pathname}?${new URLSearchParams([
            ...Array.from(url.searchParams.entries()),
            ...Object.entries(params),
        ])}`,
    );
};

type CityRes = {
    name: string;
    country?: string;
    latitude: number;
    longitude: number;
    admin1?: string;
};

type City = {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
    adminArea: string;
};

const CITY_URL = new URL('https://geocoding-api.open-meteo.com/v1/search?language=en&format=json&count=10');

const fetchCities = async (city: string): Promise<City[] | Error> => {
    try {
        const res: ReadonlyArray<CityRes> = await fetch(withSearchParams(CITY_URL, { name: city }))
            .then((res) => res.json())
            .then((json) => json.results);

        return res.map((city) => ({
            name: city.name,
            country: city.country || 'None',
            latitude: city.latitude,
            longitude: city.longitude,
            adminArea: city.admin1 || 'None',
        }));
    } catch (e) {
        return new Error(`Failed to fetch city with name ${city || '<empty>'}\n${e}`);
    }
};

type WeatherRes = {
    current: {
        is_day: number;
        precipitation: number;
        rain: number;
        snowfall: number;
        relative_humidity_2m: number;
        temperature_2m: number;
        apparent_temperature: number;
        wind_speed_10m: number;
        wind_direction_10m: number;
        wind_gusts_10m: number;
    };
    current_units: Record<keyof WeatherRes['current'], string>;
};

type Temperature = {
    factual: number;
    apparent: number;
};

type Wind = {
    speed: number;
    direction: number;
    gusts: number;
};

type Weather = {
    isDay: boolean;
    temperature: Temperature;
    wind: Wind;
    rain: number;
    snowfall: number;
    precipitation: number;
    relativeHumidity: number;
};

type WeatherUnits = {
    [K in keyof Weather]: K extends 'temperature' ? { [T in keyof Weather['temperature']]: string }
    : K extends 'wind' ? { [W in keyof Weather['wind']]: string }
    : string;
};

const WEATHER_URL = new URL(
    'https://api.open-meteo.com/v1/forecast?current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,snowfall,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
);

const fetchWeather = async (
    latitude: number,
    longitude: number,
): Promise<{ weather: Weather; units: WeatherUnits } | Error> => {
    try {
        const res: WeatherRes = await fetch(
            withSearchParams(WEATHER_URL, {
                latitude: latitude.toString(),
                longitude: longitude.toString(),
            }),
        )
            .then((res) => res.json())
            .then(({ current, current_units }) => ({ current, current_units }));

        const mapRes = <
            TResponse extends WeatherRes['current'] | WeatherRes['current_units'],
            TValue extends TResponse extends WeatherRes['current'] ? Weather : WeatherUnits,
        >(
            res: TResponse,
        ): TValue => {
            return {
                isDay: res.is_day,
                precipitation: res.precipitation,
                rain: res.rain,
                snowfall: res.snowfall,
                relativeHumidity: res.relative_humidity_2m,
                temperature: {
                    factual: res.temperature_2m,
                    apparent: res.apparent_temperature,
                },
                wind: {
                    speed: res.wind_speed_10m,
                    direction: res.wind_direction_10m,
                    gusts: res.wind_gusts_10m,
                },
            } as TValue;
        };

        return {
            weather: mapRes(res.current),
            units: mapRes(res.current_units),
        };
    } catch (e) {
        return new Error(`Failed to fetch city with latitude: ${latitude} and longitude: ${longitude}'\n${e}`);
    }
};
