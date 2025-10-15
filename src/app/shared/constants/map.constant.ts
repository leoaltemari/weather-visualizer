import { CardinalDirection } from '@models/map.model';

export const DEFAULT_MAP_ZOOM = 7;
export const FOCUS_MAP_ZOOM = 9;
export const MAX_MAP_ZOOM = 15;

export const DEFAULT_MAP_CENTER: [number, number] = [52.1, 5.3];

export const DEFAULT_MAP_OPTIONS = {
  center: DEFAULT_MAP_CENTER,
  zoom: DEFAULT_MAP_ZOOM,
} as const;

/** Dutch (Netherlands) cardinal directions  */
export const cardinalDirectionsToNumberMap: Record<CardinalDirection, number> = {
  noord: 0,
  n: 0,
  nno: 22.5,
  no: 45,
  ono: 67.5,
  oost: 90,
  o: 90,
  ozo: 112.5,
  zo: 135,
  zzo: 157.5,
  zuid: 180,
  z: 180,
  zzw: 202.5,
  zw: 225,
  wzw: 247.5,
  west: 270,
  w: 270,
  wnw: 292.5,
  nw: 315,
  nnw: 337.5,
};
