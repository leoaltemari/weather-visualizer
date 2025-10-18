export type Latitude = number;
export type Longitude = number;

export type Position = [Latitude, Longitude];

export interface MapOptions {
  center: Position;
  zoom: number;
}

export type CardinalDirection = 'n' | 'no' | 'o' | 'zo' | 'z' | 'zw' | 'w' | 'nw';

export interface HeatMapSample {
  lat: Latitude;
  lon: Longitude;
  value: number;
}

export type HeatPoint = [Latitude, Longitude, number];

export interface HeatLayerOptions {
  /** the minimum opacity the heat will start at, range [0, 100] */
  radius?: number;
  /** radius of each "point" of the heatmap, 25 by default, range [0, 1] */
  minOpacity?: number;
  /** amount of blur, 15 by default, range [0, 100] */
  blur?: number;
  /** maxZoom - zoom level where the points reach maximum intensity (as intensity scales with zoom), equals maxZoom of the map by default */
  maxZoom?: number;
  /** gradient - color gradient config, e.g. {0.4: 'blue', 0.65: 'lime', 1: 'red'} */
  gradient?: Record<number, string>;
}
