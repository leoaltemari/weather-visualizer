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

    untracked(() => {
      const prevHiddenByKey = this.readPrevHiddenByKey(this.chart!);
      const nextDatasets = this.buildDatasetsWithPreservedHidden(datasets, prevHiddenByKey);

      this.chart!.data.labels = labels;
      this.chart!.data.datasets = nextDatasets;
      this.chart!.update('none');
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

  // Build a stable key for a dataset (prefer label, fallback to index)
  private makeDatasetKey(ds: ChartDataset<'line'>, index: number): string {
    return ds.label ?? String(index);
  }

  // Read the previous hidden state by dataset key (combining meta.hidden and ds.hidden)
  private readPrevHiddenByKey(chart: CustomLineChart): Map<string, boolean> {
    const prevHidden = new Map<string, boolean>();
    const prevDatasets = chart.data.datasets as ChartDataset<'line'>[];

    prevDatasets.forEach((ds, i) => {
      const meta = chart.getDatasetMeta(i);
      const key = this.makeDatasetKey(ds, i);
      const wasHidden = meta.hidden === null ? Boolean(ds.hidden) : Boolean(meta.hidden);
      prevHidden.set(key, wasHidden);
    });

    return prevHidden;
  }

  // Produce new datasets with preserved hidden state (keeps inputs immutable)
  private buildDatasetsWithPreservedHidden(
    next: ChartDataset<'line'>[],
    hiddenByKey: Map<string, boolean>,
  ): ChartDataset<'line'>[] {
    return next.map((ds, i) => {
      const key = this.makeDatasetKey(ds, i);
      const wasHidden = hiddenByKey.get(key);
      const copy: ChartDataset<'line'> = { ...ds };

      copy.hidden = wasHidden ? wasHidden : undefined;

      return copy;
    });
  }
}
