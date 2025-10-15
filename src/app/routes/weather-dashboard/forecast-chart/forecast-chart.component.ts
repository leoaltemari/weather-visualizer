import { AfterViewInit, Component, ElementRef, inject, OnDestroy, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { ChartService } from '@services/chart.service';
import { WeatherService } from '@services/weather.service';

import type { Chart as ChartJS, ChartOptions, ChartDataset, TooltipItem } from 'chart.js';

@Component({
  selector: 'app-forecast-chart',
  templateUrl: './forecast-chart.component.html',
  host: { class: 'block' },
  styleUrl: './forecast-chart.component.scss',
  providers: [ChartService],
})
export class ForecastChartComponent implements AfterViewInit, OnDestroy {
  private readonly chartService = inject(ChartService);
  private readonly weatherService = inject(WeatherService);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chart?: ChartJS<'line'>;

  // Chart datasets
  private readonly labels = toSignal<string[], string[]>(
    this.weatherService.get3LettersDayforecast(),
    { initialValue: [] },
  );
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

  private readonly options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: 'easeInOutCubic',
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb',
          font: { weight: 600 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: 'rgba(59, 130, 246, 0.4)',
        borderWidth: 1,
        titleColor: '#e5e7eb',
        bodyColor: '#e5e7eb',
        displayColors: false,
        callbacks: {
          label: (ctx: TooltipItem<'line'>) => {
            const label = ctx.dataset.label ?? '';
            const value = ctx.parsed.y;
            const unit = ctx.dataset.yAxisID === 'y2' ? '%' : '°C';
            return `${label}: ${value}${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
      },
      y: {
        ticks: {
          color: '#9ca3af',
          callback: (value) => `${value}°`,
        },
        grid: { color: 'rgba(148, 163, 184, 0.12)' },
        beginAtZero: true,
        suggestedMax: 30,
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
    },
  };

  ngAfterViewInit(): void {
    const ctx = this.canvasRef()?.nativeElement.getContext('2d');
    if (!ctx) return;

    // Datasets
    const maxDataset = this.chartService.createLineDatasetConfig(
      'Max Temp (°C)',
      this.maxTemperature(),
      'y',
      {
        main: 'rgb(239, 68, 68)', // red-500
        areaGradient: {
          start: 'rgba(239,68,68,0.30)',
          midle: 'rgba(239,68,68,0.15)',
          end: 'rgba(239,68,68,0.00)',
        },
      },
    );

    const minDataset = this.chartService.createLineDatasetConfig(
      'Min Temp (°C)',
      this.minTemperature(),
      'y',
      {
        main: 'rgb(59, 130, 246)', // blue-500
        areaGradient: {
          start: 'rgba(59,130,246,0.30)',
          midle: 'rgba(59,130,246,0.15)',
          end: 'rgba(59,130,246,0.00)',
        },
      },
    );

    const rainDataset = this.chartService.createLineDatasetConfig(
      'Rain Chance (%)',
      this.rainChance(),
      'y2',
      {
        main: 'rgb(16, 185, 129)', // emerald-500
        areaGradient: {
          start: 'rgba(16,185,129,0.30)',
          midle: 'rgba(16,185,129,0.15)',
          end: 'rgba(16,185,129,0.00)',
        },
      },
    );

    this.chart = this.chartService.createLineChart(
      ctx,
      this.labels(),
      [maxDataset, minDataset, rainDataset],
      this.options,
    );
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
