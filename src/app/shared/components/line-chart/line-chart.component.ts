import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  untracked,
  viewChild,
} from '@angular/core';

import { CustomLineChart, TooltipLabelCallback } from '@models/chart.model';
import { ChartService } from '@services/chart.service';

import type { ChartOptions, ChartDataset } from 'chart.js';

@Component({
  selector: 'app-line-chart',
  providers: [ChartService],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent implements AfterViewInit, OnDestroy {
  readonly labels = input.required<string[]>();
  readonly scales = input.required<ChartOptions<'line'>['scales']>();
  readonly datasets = input.required<ChartDataset<'line'>[]>();
  readonly tooltipLabelCallback = input<TooltipLabelCallback>();

  private readonly chartService = inject(ChartService);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chart?: CustomLineChart;

  private readonly options = computed(
    (): ChartOptions<'line'> => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: 'easeInOutCubic',
        onComplete: () => {
          if (!this.chart) return;

          this.chart.options.animation = {
            ...this.chart.options.animation,
            duration: 800,
          };
        },
      },
      animations: {
        tension: {
          duration: 1000,
          easing: 'easeInOutCubic',
          from: 0.4,
          to: 0.3,
        },
        y: {
          duration: 800,
          easing: 'easeInOutQuart',
          from: (() => {
            const droppedStates = new WeakMap();
            return (ctx) => {
              if (ctx.type === 'data' && ctx.mode === 'default' && !droppedStates.get(ctx)) {
                droppedStates.set(ctx, true);
                return ctx.chart.scales['y'].getPixelForValue(0);
              }
              return undefined;
            };
          })(),
        },
      },
      transitions: {
        show: {
          animations: {
            x: { from: 0 },
            y: { from: 0 },
          },
        },
        hide: {
          animations: {
            x: { to: 0 },
            y: { to: 0 },
          },
        },
        active: {
          animation: {
            duration: 300,
          },
        },
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
          onHover: (event, legendItem, legend) => {
            (event.native?.target as HTMLElement).style.cursor = 'pointer';
          },
          onLeave: (event, legendItem, legend) => {
            (event.native?.target as HTMLElement).style.cursor = 'default';
          },
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          borderColor: 'rgba(59, 130, 246, 0.4)',
          borderWidth: 1,
          titleColor: '#e5e7eb',
          bodyColor: '#e5e7eb',
          displayColors: false,
          callbacks: { label: this.tooltipLabelCallback() },
        },
      },
      scales: this.scales(),
    }),
  );

  // React to input signal changes and update the chart accordingly
  private readonly updateChartOnInputsChange = effect(() => {
    const labels = this.labels();
    const datasets = this.datasets();

    if (!this.chart) return;

    // Perform mutations without tracking and defer the update to avoid re-entrancy
    untracked(() => {
      this.chart!.data.labels = labels;
      this.chart!.data.datasets = datasets;
      this.chart?.update('none');
    });
  });

  ngAfterViewInit(): void {
    const context = this.canvasRef()?.nativeElement.getContext('2d');

    if (!context) return;

    this.chart = this.chartService.createLineChart({
      context,
      labels: this.labels(),
      datasets: this.datasets(),
      options: this.options(),
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
