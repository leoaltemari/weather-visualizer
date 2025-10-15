export type RgbColor = `rgb(${number},${number},${number})`;
export type RgbaColor = `rgba(${number},${number},${number},${number | `${number}.${number}`})`;

export type RGB = RgbColor | RgbaColor;

export interface GradientColor {
  start: RGB;
  midle: RGB;
  end: RGB;
}

export interface LineChartColor {
  main: RGB;
  areaGradient: GradientColor;
}

export interface ShadowPluginOptions {
  color?: RGB;
  blur?: number;
  offsetY?: number;
}
