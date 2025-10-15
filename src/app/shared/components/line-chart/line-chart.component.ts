import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  viewChild,
} from '@angular/core';

import { TooltipLabelCallback } from '@models/chart.mode';
import { ChartService } from '@services/chart.service';

import type {
  Chart as ChartJS,
  ChartOptions,
  ChartDataset,
  TooltipItem,
  ScaleChartOptions,
  TooltipOptions,
} from 'chart.js';

@Component({
  selector: 'app-line-chart',
  imports: [],
  providers: [ChartService],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent implements AfterViewInit, OnDestroy {
  readonly labels = input.required<string[]>();
  readonly scales = input.required<ChartOptions<'line'>['scales']>();
  readonly datasets = input.required<ChartDataset<'line'>[]>();
  readonly tooltipLabelCallback = input<TooltipLabelCallback>();

  private readonly chartService = inject(ChartService);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chart?: ChartJS<'line'>;

  private readonly options = computed(
    (): ChartOptions<'line'> => ({
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
          callbacks: { label: this.tooltipLabelCallback() },
        },
      },
      scales: this.scales(),
    }),
  );

  ngAfterViewInit(): void {
    const context = this.canvasRef()?.nativeElement.getContext('2d');

    if (!context) return;

    this.chart = this.chartService.createLineChart(
      context,
      this.labels(),
      this.datasets(),
      this.options(),
    );
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
