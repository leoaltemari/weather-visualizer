import {
  AIR_PRESSURE_COLORS,
  PRESSURE,
  TEMPERATURE_COLORS,
  TEMPERATURES,
  WIND,
  WIND_COLORS,
} from '@constants/weather.constant';
import { Station } from '@models/buienradar-api.model';
import {
  PRESSURE_UNIT,
  TEMPERATURES_UNIT,
  VisualizationType,
  WIND_UNIT,
} from '@models/weather.model';

/**
 * Retrieves the numeric value for a specific visualization type from a weather station.
 *
 * Extracts the appropriate measurement value (temperature, wind speed, or air pressure)
 * based on the specified visualization type.
 *
 * @param type - The type of weather data to retrieve
 * @param station - The weather station containing the measurement data
 * @returns The numeric value for the specified type, or null if not available
 */
export const getStationValue = (type: VisualizationType, station: Station): number | null => {
  const valueByType = {
    [VisualizationType.temperature]: station.temperature,
    [VisualizationType.wind]: station.windspeed,
    [VisualizationType.pressure]: station.airpressure,
  } as const;

  return valueByType[type] ?? null;
};

/**
 * Retrieves the formatted value with unit for a specific visualization type from a weather station.
 *
 * Extracts the measurement value and formats it with the appropriate unit
 * (°C for temperature, km/h for wind, hPa for pressure) based on the visualization type.
 *
 * @param type - The type of weather data to retrieve and format
 * @param station - The weather station containing the measurement data
 * @returns The formatted value with unit as a string, or null if not available
 */
export const getStationValueWithUnit = (
  type: VisualizationType,
  station: Station,
): string | null => {
  const unitByType = {
    [VisualizationType.temperature]: TEMPERATURES_UNIT.celcius,
    [VisualizationType.wind]: WIND_UNIT.kmh,
    [VisualizationType.pressure]: PRESSURE_UNIT.hpa,
  } as const;

  if (!unitByType[type]) return null;

  return `${getStationValue(type, station)} ${unitByType[type]}`;
};

/**
 * Determines the color representation for a given weather value based on visualization type.
 *
 * Maps numeric weather values to predefined color codes based on thresholds:
 * - Temperature: Hot (red), Mild (yellow), or Cold (blue)
 * - Wind: Strong (dark) or Light (light)
 * - Pressure: High (blue) or Low (orange)
 * Returns a default color if the value is null or undefined.
 *
 * @param type - The type of weather data being visualized
 * @param value - The numeric value to determine the color for, or null
 * @returns A color code string representing the value's classification
 */
export const getColorByVisualizationType = (
  type: VisualizationType,
  value: number | null,
): string => {
  const getTemperatureColor = (temperature: number | null): string => {
    if (!temperature && temperature !== 0) return TEMPERATURE_COLORS.NONE;
    if (temperature > TEMPERATURES.HOT) return TEMPERATURE_COLORS.HOT;
    if (temperature > TEMPERATURES.MILD) return TEMPERATURE_COLORS.MILD;

    return TEMPERATURE_COLORS.COLD;
  };

  const getWindColor = (wind: number | null): string => {
    if (!wind && wind !== 0) return WIND_COLORS.NONE;

    return wind > WIND.STRONG ? WIND_COLORS.STRONG : WIND_COLORS.LIGHT;
  };

  const getAirPressureColor = (pressure: number | null): string => {
    if (!pressure && pressure !== 0) return AIR_PRESSURE_COLORS.NONE;
    if (pressure > PRESSURE.HIGH) return AIR_PRESSURE_COLORS.HIGH;
    return AIR_PRESSURE_COLORS.LOW;
  };

  switch (type) {
    case VisualizationType.temperature:
      return getTemperatureColor(value);
    case VisualizationType.wind:
      return getWindColor(value);
    case VisualizationType.pressure:
      return getAirPressureColor(value);
    default:
      return TEMPERATURE_COLORS.NONE;
  }
};
