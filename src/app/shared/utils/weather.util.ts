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

export const getStationValue = (type: VisualizationType, station: Station): number | null => {
  const valueByType = {
    [VisualizationType.temperature]: station.temperature,
    [VisualizationType.wind]: station.windspeed,
    [VisualizationType.pressure]: station.airpressure,
  } as const;

  return valueByType[type] ?? null;
};

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
