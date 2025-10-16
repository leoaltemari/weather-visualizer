import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { LineChartComponent } from '@components/line-chart/line-chart.component';
import { TitleComponent } from '@components/title/title.component';
import { TooltipLabelCallback } from '@models/chart.model';
import { ChartService } from '@services/chart.service';
import { WeatherService } from '@services/weather.service';

import type { ChartOptions, TooltipItem } from 'chart.js';

@Component({
  selector: 'app-forecast-chart',
  templateUrl: './forecast-chart.component.html',
  imports: [TitleComponent, LineChartComponent],
  host: { class: 'flex flex-col' },
  providers: [ChartService],
})
export class ForecastChartComponent {
  private readonly chartService = inject(ChartService);
  private readonly weatherService = inject(WeatherService);

  // Chart Configurations
  readonly chartScales: ChartOptions<'line'>['scales'] = {
    x: {
      ticks: { color: '#9ca3af' },
      grid: { color: 'rgba(148, 163, 184, 0.12)' },
    },
    y: {
      ticks: {
        color: '#9ca3af',
        callback: (value) => `${value}°`,
      },
      grid: { color: 'rgba(148, 163, 184, 0.12)' },
      suggestedMax: 35,
      suggestedMin: -25,
    },
    y2: {
      position: 'right',
      ticks: {
        color: '#9ca3af',
        callback: (value) => `${value}%`,
      },
      grid: { drawOnChartArea: false },
      beginAtZero: true,
      suggestedMax: 100,
    },
  };

  readonly chartTooltipLabelCallback: TooltipLabelCallback = (ctx: TooltipItem<'line'>) => {
    const label = ctx.dataset.label ?? '';
    const value = ctx.parsed.y;
    const unit = ctx.dataset.yAxisID === 'y2' ? '%' : '°C';

    return `${label}: ${value}${unit}`;
  };

  // Data Source Signals
  readonly labels = toSignal<string[], string[]>(this.weatherService.get3LettersDayforecast(), {
    initialValue: [],
  });
  private readonly minTemperature = toSignal<number[], number[]>(
    this.weatherService.getMinTemperatureForecast(),
    { initialValue: [] },
  );
  private readonly maxTemperature = toSignal<number[], number[]>(
    this.weatherService.getMaxTemperatureForecast(),
    { initialValue: [] },
  );
  private readonly rainChance = toSignal<number[], number[]>(
    this.weatherService.getRainChanceForecast(),
    { initialValue: [] },
  );

  // Datasets
  readonly maxTemperatureDataset = computed(() => {
    return this.chartService.createLineDataset({
      label: 'Max Temp (°C)',
      data: this.maxTemperature(),
      yAxisID: 'y',
      color: {
        main: 'rgb(239, 68, 68)', // red-500
        areaGradient: {
          start: 'rgba(239,68,68,0.30)',
          midle: 'rgba(239,68,68,0.15)',
          end: 'rgba(239,68,68,0.00)',
        },
      },
    });
  });

  readonly minTemperatureDataset = computed(() => {
    return this.chartService.createLineDataset({
      label: 'Min Temp (°C)',
      data: this.minTemperature(),
      yAxisID: 'y',
      color: {
        main: 'rgb(59, 130, 246)', // blue-500
        areaGradient: {
          start: 'rgba(59,130,246,0.30)',
          midle: 'rgba(59,130,246,0.15)',
          end: 'rgba(59,130,246,0.00)',
        },
      },
    });
  });

  readonly rainChanceDataset = computed(() => {
    return this.chartService.createLineDataset({
      label: 'Rain Chance (%)',
      data: this.rainChance(),
      yAxisID: 'y2',
      color: {
        main: 'rgb(16, 185, 129)', // emerald-500
        areaGradient: {
          start: 'rgba(16,185,129,0.30)',
          midle: 'rgba(16,185,129,0.15)',
          end: 'rgba(16,185,129,0.00)',
        },
      },
    });
  });
}
