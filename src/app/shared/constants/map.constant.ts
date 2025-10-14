export const DEFAULT_MAP_ZOOM = 8;
export const FOCUS_MAP_ZOOM = 9;
export const MAX_MAP_ZOOM = 15;

export const DEFAULT_MAP_CENTER: [number, number] = [52.1, 5.3];

export const DEFAULT_MAP_OPTIONS = {
  center: DEFAULT_MAP_CENTER,
  zoom: DEFAULT_MAP_ZOOM,
} as const;
