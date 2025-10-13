export const TEMPERATURE_COLORS: Record<'HOT' | 'MILD' | 'COLD' | 'NONE', `#${string}`> = {
  HOT: '#ef4444',
  MILD: '#facc15',
  COLD: '#3b82f6',
  NONE: '#9ca3af',
};

export const WIND_COLORS: Record<'STRONG' | 'LIGHT' | 'NONE', `#${string}`> = {
  STRONG: '#a855f7',
  LIGHT: '#22d3ee',
  NONE: '#9ca3af',
};

export const AIR_PRESSURE_COLORS: Record<'HIGH' | 'LOW' | 'NONE', `#${string}`> = {
  HIGH: '#84cc16',
  LOW: '#f97316',
  NONE: '#9ca3af',
};

export const TEMPERATURES = {
  HOT: 20,
  MILD: 10,
  COLD: 0,
};

export const WIND = {
  STRONG: 10,
  LIGHT: 0,
};

export const PRESSURE = {
  HIGH: 1020,
  LOW: 1000,
};
