export type Latitude = number;
export type Longitude = number;

export type Position = [Latitude, Longitude];

export interface MapOptions {
  center: Position;
  zoom: number;
}
