export const VisualizationType = {
  temperature: 'temperature',
  pressure: 'pressure',
  wind: 'wind',
} as const;

export type VisualizationType = (typeof VisualizationType)[keyof typeof VisualizationType];
