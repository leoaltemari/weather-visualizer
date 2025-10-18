import { CardinalDirection } from '@models/map.model';

export const DEFAULT_MAP_ZOOM = 7;
export const FOCUS_MAP_ZOOM = 9;
export const MAX_MAP_ZOOM = 15;

/** Center of Netherlands */
export const DEFAULT_MAP_CENTER: [number, number] = [52.1, 5.3];

export const DEFAULT_MAP_OPTIONS = {
  center: DEFAULT_MAP_CENTER,
  zoom: DEFAULT_MAP_ZOOM,
} as const;

/** Dutch (Netherlands) cardinal directions  */
export const cardinalDirectionsToNumberMap: Record<CardinalDirection, number> = {
  n: 0,
  no: 45,
  o: 90,
  zo: 135,
  z: 180,
  zw: 225,
  w: 270,
  nw: 315,
};
