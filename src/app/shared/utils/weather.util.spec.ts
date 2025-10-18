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

import {
  getColorByVisualizationType,
  getStationValue,
  getStationValueWithUnit,
} from './weather.util';

describe('weather.util', () => {
  const base: Station = {
    stationid: 1,
    stationname: 's',
    regio: 'r',
    timestamp: new Date(),
    weatherdescription: '',
    fullIconUrl: '',
    lat: 0,
    lon: 0,
    windspeed: 0,
    temperature: 0,
    feeltemperature: 0,
    humidity: 0,
    airpressure: 0,
    rainFallLast24Hour: 0,
    rainFallLastHour: 0,
  };

  const makeStation = (o: Partial<Station>): Station => ({ ...base, ...o });

  describe('getStationValue', () => {
    it('returns temperature value', () => {
      const s = makeStation({ temperature: 12.3 });
      expect(getStationValue(VisualizationType.temperature, s)).toBe(12.3);
    });

    it('returns wind value', () => {
      const s = makeStation({ windspeed: 7 });
      expect(getStationValue(VisualizationType.wind, s)).toBe(7);
    });

    it('returns pressure value', () => {
      const s = makeStation({ airpressure: 1012 });
      expect(getStationValue(VisualizationType.pressure, s)).toBe(1012);
    });

    it('returns null for invalid type', () => {
      expect(getStationValue('invalid' as any, base)).toBeNull();
    });
  });

  describe('getStationValueWithUnit', () => {
    it('returns temperature with unit', () => {
      const s = makeStation({ temperature: 1 });
      expect(getStationValueWithUnit(VisualizationType.temperature, s)).toBe(
        `1 ${TEMPERATURES_UNIT.celcius}`,
      );
    });

    it('returns wind with unit', () => {
      const s = makeStation({ windspeed: 2 });
      expect(getStationValueWithUnit(VisualizationType.wind, s)).toBe(`2 ${WIND_UNIT.kmh}`);
    });

    it('returns pressure with unit', () => {
      const s = makeStation({ airpressure: 3 });
      expect(getStationValueWithUnit(VisualizationType.pressure, s)).toBe(`3 ${PRESSURE_UNIT.hpa}`);
    });

    it('returns null when unit is not mapped (invalid type)', () => {
      expect(getStationValueWithUnit('invalid' as any, base)).toBeNull();
    });
  });

  describe('getColorByVisualizationType', () => {
    it('temperature: returns NONE for null', () => {
      expect(getColorByVisualizationType(VisualizationType.temperature, null)).toBe(
        TEMPERATURE_COLORS.NONE,
      );
    });

    it('temperature: returns COLD for low/zero', () => {
      expect(getColorByVisualizationType(VisualizationType.temperature, 0)).toBe(
        TEMPERATURE_COLORS.COLD,
      );
    });

    it('temperature: returns MILD between thresholds', () => {
      expect(
        getColorByVisualizationType(VisualizationType.temperature, TEMPERATURES.MILD + 1),
      ).toBe(TEMPERATURE_COLORS.MILD);
    });

    it('temperature: returns HOT above hot threshold', () => {
      expect(getColorByVisualizationType(VisualizationType.temperature, TEMPERATURES.HOT + 1)).toBe(
        TEMPERATURE_COLORS.HOT,
      );
    });

    it('wind: returns NONE for null', () => {
      expect(getColorByVisualizationType(VisualizationType.wind, null)).toBe(WIND_COLORS.NONE);
    });

    it('wind: returns LIGHT for value at or below strong threshold', () => {
      expect(getColorByVisualizationType(VisualizationType.wind, 0)).toBe(WIND_COLORS.LIGHT);
    });

    it('wind: returns STRONG for value above strong threshold', () => {
      expect(getColorByVisualizationType(VisualizationType.wind, WIND.STRONG + 1)).toBe(
        WIND_COLORS.STRONG,
      );
    });

    it('pressure: returns NONE for null', () => {
      expect(getColorByVisualizationType(VisualizationType.pressure, null)).toBe(
        AIR_PRESSURE_COLORS.NONE,
      );
    });

    it('pressure: returns LOW at or below high threshold', () => {
      expect(getColorByVisualizationType(VisualizationType.pressure, 0)).toBe(
        AIR_PRESSURE_COLORS.LOW,
      );
    });

    it('pressure: returns HIGH above high threshold', () => {
      expect(getColorByVisualizationType(VisualizationType.pressure, PRESSURE.HIGH + 1)).toBe(
        AIR_PRESSURE_COLORS.HIGH,
      );
    });

    it('default: returns NONE for unsupported type', () => {
      expect(getColorByVisualizationType('invalid' as any, 42)).toBe(TEMPERATURE_COLORS.NONE);
    });
  });
});
