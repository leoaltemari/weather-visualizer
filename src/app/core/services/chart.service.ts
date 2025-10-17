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

  /**
   * Creates a configured line chart dataset with styling and gradient background.
   *
   * Generates a dataset with predefined visual properties including border styling,
   * point styling, fill configuration, and gradient background colors.
   *
   * @param config - Configuration object containing label, data, axis assignment, and color settings
   * @returns A fully configured ChartDataset for line charts
   */
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

  /**
   * Creates a Chart.js plugin that adds shadow effects to line chart datasets.
   *
   * Applies a shadow with configurable blur, offset, and color to enhance
   * the visual appearance of chart lines. The shadow is drawn before each
   * dataset and the context is restored afterward.
   *
   * @returns A Chart.js plugin object with beforeDatasetDraw and afterDatasetDraw hooks
   */
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

    const linearGradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);

    linearGradient.addColorStop(0, gradient.start);
    linearGradient.addColorStop(1, gradient.end);

    return linearGradient;
  }
}
