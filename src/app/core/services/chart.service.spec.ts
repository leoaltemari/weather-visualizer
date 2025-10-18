import { TestBed } from '@angular/core/testing';

import { LineChartColor } from '@models/chart.model';

import { ChartService } from './chart.service';

interface ChartArea {
  top: number;
  bottom: number;
}

interface GradientMock {
  addColorStop: jasmine.Spy;
}

interface CanvasContextMock {
  createLinearGradient: jasmine.Spy;
}

interface ChartContext {
  chart: {
    ctx: CanvasContextMock;
    chartArea: ChartArea;
  };
}

interface ChartContextWithoutArea {
  chart: {
    chartArea: undefined;
  };
}

interface PluginContext {
  save: jasmine.Spy;
  restore: jasmine.Spy;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetY?: number;
}

interface ChartForPlugin {
  ctx: PluginContext;
}

describe('ChartService', () => {
  let service: ChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChartService],
    });
    service = TestBed.inject(ChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a line dataset with configured properties and handle background gradient with and without chart area', () => {
    const colorConfig: LineChartColor = {
      main: 'rgb(255,0,0)',
      areaGradient: {
        start: 'rgba(255,0,0,0.45)',
        midle: 'rgba(255,0,0,0.25)',
        end: 'rgba(255,0,0,0.05)',
      },
    };

    const dataset = service.createLineDataset({
      label: 'Temperature',
      data: [1, 2, 3],
      yAxisID: 'y',
      color: colorConfig,
    });

    expect(dataset.label).toBe('Temperature');
    expect(dataset.data).toEqual([1, 2, 3]);
    expect(dataset.yAxisID).toBe('y');
    expect(dataset.fill).toBeTrue();
    expect(dataset.borderColor).toBe(colorConfig.main);
    expect(dataset.pointBackgroundColor).toBe(colorConfig.main);
    expect(typeof dataset.backgroundColor).toBe('function');

    const backgroundColorFunction = dataset.backgroundColor as (
      ctx: ChartContextWithoutArea | ChartContext,
    ) => string | CanvasGradient;

    const scriptableContextWithoutArea: ChartContextWithoutArea = {
      chart: {
        chartArea: undefined,
      },
    };

    const colorWhenNoArea = backgroundColorFunction(scriptableContextWithoutArea);
    expect(colorWhenNoArea).toBe(colorConfig.areaGradient.midle);

    const gradientStub: GradientMock = {
      addColorStop: jasmine.createSpy('addColorStop'),
    };
    const createLinearGradientSpy = jasmine
      .createSpy('createLinearGradient')
      .and.returnValue(gradientStub as unknown as CanvasGradient);

    const scriptableContextWithArea: ChartContext = {
      chart: {
        ctx: {
          createLinearGradient: createLinearGradientSpy,
        },
        chartArea: {
          top: 10,
          bottom: 210,
        },
      },
    };

    const returnedGradient = backgroundColorFunction(scriptableContextWithArea);
    expect(createLinearGradientSpy).toHaveBeenCalledWith(0, 10, 0, 210);
    expect(gradientStub.addColorStop).toHaveBeenCalledWith(0, colorConfig.areaGradient.start);
    expect(gradientStub.addColorStop).toHaveBeenCalledWith(1, colorConfig.areaGradient.end);
    expect(returnedGradient).toBe(gradientStub);
  });

  it('should create a line chart with provided config and include operational shadow plugin', () => {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = 300;
    canvasElement.height = 150;
    document.body.appendChild(canvasElement);

    const renderingContext = canvasElement.getContext('2d') as CanvasRenderingContext2D;
    const labels = ['Mon', 'Tue', 'Wed'];

    const dataset = service.createLineDataset({
      label: 'Humidity',
      data: [30, 50, 40],
      yAxisID: 'y',
      color: {
        main: 'rgb(0,128,255)',
        areaGradient: {
          start: 'rgba(0,128,255,0.45)',
          midle: 'rgba(0,128,255,0.25)',
          end: 'rgba(0,128,255,0.05)',
        },
      },
    });

    const options = {
      responsive: false,
      animation: false,
      plugins: { legend: { display: false } },
      scales: { y: { display: false } },
    } as Record<string, unknown>;

    const chartInstance = service.createLineChart({
      context: renderingContext,
      labels,
      datasets: [dataset],
      options,
    });

    expect(chartInstance).toBeTruthy();
    expect(chartInstance.config.data.labels as string[]).toEqual(labels);
    expect(chartInstance.config.data.datasets.length).toBe(1);

    const pluginsArray = (chartInstance.config.plugins || []) as Array<{
      id?: string;
      beforeDatasetDraw?: (chart: ChartForPlugin) => void;
      afterDatasetDraw?: (chart: ChartForPlugin) => void;
    }>;
    expect(Array.isArray(pluginsArray)).toBeTrue();
    const shadowPlugin = pluginsArray.find((p) => p && p.id === 'shadowLine');
    expect(shadowPlugin).toBeTruthy();

    const fakeContext: PluginContext = {
      save: jasmine.createSpy('save'),
      restore: jasmine.createSpy('restore'),
    };

    const fakeChartForPlugin: ChartForPlugin = { ctx: fakeContext };

    shadowPlugin?.beforeDatasetDraw?.(fakeChartForPlugin);
    expect(fakeContext.save).toHaveBeenCalled();
    expect(fakeContext.shadowColor).toBe('rgba(0,0,0,0.35)');
    expect(fakeContext.shadowBlur).toBe(8);
    expect(fakeContext.shadowOffsetY).toBe(3);

    shadowPlugin?.afterDatasetDraw?.(fakeChartForPlugin);
    expect(fakeContext.restore).toHaveBeenCalled();

    chartInstance.destroy();
    canvasElement.remove();
  });
});
