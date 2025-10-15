import { CardinalDirection, Latitude, Longitude } from './map.model';

export interface BuienradarApiResponse {
  buienradar: BuienradarInfo;
  actual: ActualWeather;
  forecast: Forecast;
}

export interface BuienradarInfo {
  copyright: string;
  terms: string;
  version: string;
}

export interface ActualWeather {
  actualradarurl: string;
  sunrise: string;
  sunset: string;
  stationmeasurements: Station[];
}

export interface Station {
  stationid: number;
  stationname: string;
  regio: string;
  timestamp: Date;
  weatherdescription: string;
  iconurl: string;
  fullIconUrl: string;
  graphUrl: string;
  lat: Latitude;
  lon: Longitude;
  winddirection: CardinalDirection;
  windazimuth: number;
  windspeed: number;
  temperature: number;
  groundtemperature: number;
  feeltemperature: number;
  humidity: number;
  airpressure: number;
  visibility: number;
  windgusts: number;
  precipitation: number;
  radiation: number;
  sunpower: number;
  rainFallLast24Hour: number;
  rainFallLastHour: number;
  windspeedBft: number;
  measured: boolean;
}

export interface Forecast {
  weatherreport: WeatherReport;
  fivedayforecast: WeatherForecast[];
}

export interface WeatherReport {
  published: Date;
  title: string;
  summary: string;
  text: string;
  author: string;
  authorbio: string;
}

export interface WeatherForecast {
  day: Date;
  mintemperature: string;
  maxtemperature: string;
  mintemperatureMax: number;
  mintemperatureMin: number;
  maxtemperatureMax: number;
  maxtemperatureMin: number;
  rainChance: number;
  sunChance: number;
  windDirection: CardinalDirection;
  wind: number;
  mmRainMin: number;
  mmRainMax: number;
  weatherdescription: string;
  iconurl: string;
  fullIconUrl: string;
}
