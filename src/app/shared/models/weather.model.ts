export const VisualizationType = {
  temperature: 'temperature',
  wind: 'wind',
  pressure: 'pressure',
} as const;

export type VisualizationType = (typeof VisualizationType)[keyof typeof VisualizationType];

export const TEMPERATURES_UNIT = {
  celcius: 'ºC',
  fahrenheit: 'ºF',
} as const;

export const WIND_UNIT = {
  kmh: 'km/h',
  ms: 'm/s',
} as const;

export const PRESSURE_UNIT = {
  hpa: 'hPa',
  atm: 'atm',
} as const;

export type TemperaturesUnit = (typeof TEMPERATURES_UNIT)[keyof typeof TEMPERATURES_UNIT];
export type WindUnit = (typeof WIND_UNIT)[keyof typeof WIND_UNIT];
export type PressureUnit = (typeof PRESSURE_UNIT)[keyof typeof PRESSURE_UNIT];
