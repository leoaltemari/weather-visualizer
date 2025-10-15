import { Chart, TooltipItem, TooltipModel } from 'chart.js';

export type CustomLineChart = Chart<'line'>;

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

export type TooltipLabelCallback = (
  this: TooltipModel<'line'>,
  tooltipItem: TooltipItem<'line'>,
) => string | string[] | void;
