import { Injectable } from '@angular/core';

import { GradientColor, LineChartColor, ShadowPluginOptions } from '@models/chart.mode';

// Switch to auto bundle so scales/controllers are registered
import Chart from 'chart.js/auto';

import type { ChartDataset, ChartOptions, Color, Plugin, Point, ScriptableContext } from 'chart.js';

@Injectable()
export class ChartService {
  public createLineChart(
    context: CanvasRenderingContext2D,
    labels: string[],
    datasets: ChartDataset<'line'>[],
    options: ChartOptions<'line'>,
  ): Chart<'line', (number | Point | null)[], unknown> {
    return new Chart(context, {
      type: 'line',
      data: { labels, datasets },
      options,
      plugins: [this.createShadowLinePlugin()],
    });
  }

  public createLineDatasetConfig(
    label: string,
    data: (number | Point | null)[],
    yAxisID: 'y' | 'y2',
    color: LineChartColor,
  ): ChartDataset<'line'> {
    return {
      label,
      data,
      yAxisID,
      tension: 0.35,
      borderWidth: 2,
      borderColor: color.main,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBorderWidth: 1.5,
      pointBackgroundColor: color.main,
      pointBorderColor: 'rgba(255, 255, 255, 0.85)',
      fill: true,
      backgroundColor: (context) => this.getBackgroundColorGradient(context, color.areaGradient),
    };
  }

  public createShadowLinePlugin(opts: ShadowPluginOptions = {}): Plugin<'line'> {
    const { color = 'rgba(0,0,0,0.35)', blur = 8, offsetY = 3 } = opts;

    return {
      id: 'shadowLine',
      beforeDatasetDraw: (chart) => {
        const { ctx } = chart;
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = blur;
        ctx.shadowOffsetY = offsetY;
      },
      afterDatasetDraw: (chart) => {
        const { ctx } = chart;
        ctx.restore();
      },
    };
  }

  private getBackgroundColorGradient(
    context: ScriptableContext<'line'>,
    gradient: GradientColor,
  ): Color {
    const { chart } = context;
    const { ctx, chartArea } = chart;

    if (!chartArea) return gradient.midle;

    const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);

    g.addColorStop(0, gradient.start);
    g.addColorStop(1, gradient.end);

    return g;
  }
}
