import { CardinalDirection, Latitude, Longitude } from './map.model';

export interface BuienradarGraphQLResponse {
  data: {
    weatherData: BuienradarApiResponse;
  };
}
export interface BuienradarApiResponse {
  actual: ActualWeather;
  forecast: Forecast;
}

export interface ActualWeather {
  stationmeasurements: Station[];
}

export interface Station {
  stationid: number;
  stationname: string;
  regio: string;
  timestamp: Date;
  weatherdescription: string;
  fullIconUrl: string;
  lat: Latitude;
  lon: Longitude;
  windspeed: number;
  temperature: number;
  feeltemperature: number;
  humidity: number;
  airpressure: number;
  rainFallLast24Hour: number;
  rainFallLastHour: number;
}

export interface Forecast {
  fivedayforecast: WeatherForecast[];
}

export interface WeatherForecast {
  day: Date;
  mintemperatureMin: number;
  maxtemperatureMax: number;
  rainChance: number;
  windDirection: CardinalDirection;
  wind: number;
  fullIconUrl: string;
}
