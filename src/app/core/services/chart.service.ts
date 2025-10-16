import { Injectable } from '@angular/core';

import {
  GradientColor,
  LineChartConfig,
  LineChartDatasetConfig,
  LineChartObj,
} from '@models/chart.model';

import Chart from 'chart.js/auto';

import type { ChartDataset, Color, Plugin, ScriptableContext } from 'chart.js';

@Injectable()
export class ChartService {
  public createLineChart(config: LineChartConfig): LineChartObj {
    return new Chart(config.context, {
      type: 'line',
      data: { labels: config.labels, datasets: config.datasets },
      options: config.options,
      plugins: [this.createShadowLinePlugin()],
    });
  }

  public createLineDataset(config: LineChartDatasetConfig): ChartDataset<'line'> {
    return {
      label: config.label,
      data: config.data,
      yAxisID: config.yAxisID,
      tension: 0.35,
      borderWidth: 2,
      borderColor: config.color.main,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBorderWidth: 1.5,
      pointBackgroundColor: config.color.main,
      pointBorderColor: 'rgba(255, 255, 255, 0.85)',
      fill: true,
      backgroundColor: (context) =>
        this.getBackgroundColorGradient(context, config.color.areaGradient),
    };
  }

  private createShadowLinePlugin(): Plugin<'line'> {
    return {
      id: 'shadowLine',
      beforeDatasetDraw: (chart) => {
        const { ctx } = chart;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
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
