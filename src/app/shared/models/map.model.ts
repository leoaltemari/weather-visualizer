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
