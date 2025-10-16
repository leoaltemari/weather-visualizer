export type Latitude = number;
export type Longitude = number;

export type Position = [Latitude, Longitude];

export interface MapOptions {
  center: Position;
  zoom: number;
}

export type CardinalDirection =
  | 'noord'
  | 'n'
  | 'nno'
  | 'no'
  | 'ono'
  | 'oost'
  | 'o'
  | 'ozo'
  | 'zo'
  | 'zzo'
  | 'zuid'
  | 'z'
  | 'zzw'
  | 'zw'
  | 'wzw'
  | 'west'
  | 'w'
  | 'wnw'
  | 'nw'
  | 'nnw';

export interface HeatMapSample {
  lat: Latitude;
  lon: Longitude;
  value: number;
}

export type HeatPoint = [Latitude, Longitude, number];

export interface HeatLayerOptions {
  radius?: number;
  minOpacity?: number;
  maxZoom?: number;
  gradient?: Record<number, string>;
}
