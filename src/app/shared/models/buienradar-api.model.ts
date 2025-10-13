import { Latitude, Longitude } from './map.model';

const WindDirection = {
  n: 'North',
  ne: 'Northeast',
  e: 'East',
  se: 'Southeast',
  s: 'South',
  sw: 'Southwest',
  w: 'West',
  nw: 'Northwest',
} as const;

export type WindDirection = keyof typeof WindDirection;

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
  winddirection: WindDirection;
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
  windDirection: WindDirection;
  wind: number;
  mmRainMin: number;
  mmRainMax: number;
  weatherdescription: string;
  iconurl: string;
  fullIconUrl: string;
}
