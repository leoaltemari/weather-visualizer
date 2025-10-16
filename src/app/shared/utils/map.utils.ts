import { Station } from '@models/buienradar-api.model';
import { HeatMapSample, HeatPoint } from '@models/map.model';
import { VisualizationType } from '@models/weather.model';

import { getStationValue } from './weather.util';

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
