import { Station } from '@models/buienradar-api.model';
import { HeatMapSample, HeatPoint } from '@models/map.model';
import { VisualizationType } from '@models/weather.model';

import { getStationValue } from './weather.util';

/**
 * Creates normalized heat map points from heat map samples.
 *
 * Normalizes the intensity values to a 0-1 range and applies gamma correction
 * for stronger visual intensity. Returns an empty array if no samples are provided.
 *
 * @param samples - Array of heat map samples containing latitude, longitude, and value
 * @returns Array of heat points with normalized intensities [lat, lon, intensity]
 */
export const createHeatMapPoints = (samples: HeatMapSample[]): HeatPoint[] => {
  if (!samples.length) {
    return [];
  }

  /** Normalazing gradient */
  const values = samples.map((sample) => sample.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const denom = max - min || 1;

  const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));

  /**  Base points from stations (apply gamma for stronger intensity) */
  return samples.map((sample) => {
    const pointIntensity = clamp01(Math.pow((sample.value - min) / denom, 0.7));

    return [sample.lat, sample.lon, pointIntensity];
  });
};

/**
 * Collects valid heat map samples from weather stations based on visualization type.
 *
 * Filters out stations without valid values for the specified visualization type
 * and maps them to heat map samples containing location and value data.
 *
 * @param stations - Array of weather station data
 * @param visualizationType - Type of weather data to visualize (e.g., temperature, humidity)
 * @returns Array of valid heat map samples with non-null values
 */
export const collectValidHeatmapSamples = (
  stations: Station[],
  visualizationType: VisualizationType,
): HeatMapSample[] => {
  return stations
    .map((station) => ({
      lat: station.lat,
      lon: station.lon,
      value: getStationValue(visualizationType, station),
    }))
    .filter((sample) => !!sample.value) as HeatMapSample[];
};
