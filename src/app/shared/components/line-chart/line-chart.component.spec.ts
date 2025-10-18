import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartService } from '@services/chart.service';

import { LineChartComponent } from './line-chart.component';

describe('LineChartComponent', () => {
  let fixture: ComponentFixture<LineChartComponent>;
  let component: LineChartComponent;

  let mockChartService: {
    createLineChart: jasmine.Spy;
  };
  let lastChart: any;

  const setCanvasContext = (ctx: any) => {
    // stub private viewChild function to avoid reliance on template DOM
    (component as any).canvasRef = () => ({
      nativeElement: {
        getContext: () => ctx,
      },
    });
  };

  const initialLabels = ['L1', 'L2'];
  const initialDatasets = [
    { label: 'A', data: [1, 2], hidden: true } as any,
    { label: 'B', data: [3, 4] } as any,
  ];
  const initialScales: any = { x: { display: true }, y: { display: true } };
  const tooltipCb = jasmine.createSpy('tooltipCb').and.returnValue('tooltip');

  beforeEach(async () => {
    mockChartService = {
      createLineChart: jasmine.createSpy('createLineChart').and.callFake((args: any) => {
        lastChart = {
          data: {
            labels: [...args.labels],
            datasets: [...args.datasets],
          },
          options: args.options,
          update: jasmine.createSpy('update'),
          destroy: jasmine.createSpy('destroy'),
          getDatasetMeta: (i: number) => ({ hidden: null }),
        };
        return lastChart;
      }),
    };

    await TestBed.configureTestingModule({
      imports: [LineChartComponent],
    }).compileComponents();

    TestBed.overrideProvider(ChartService, { useValue: mockChartService });

    fixture = TestBed.createComponent(LineChartComponent);
    component = fixture.componentInstance;

    // set required inputs up-front
    fixture.componentRef.setInput('labels', initialLabels);
    fixture.componentRef.setInput('datasets', initialDatasets);
    fixture.componentRef.setInput('scales', initialScales);
    fixture.componentRef.setInput('tooltipLabelCallback', tooltipCb);
  });

  afterEach(() => {
    fixture.destroy();
    lastChart = undefined;
    mockChartService.createLineChart.calls.reset();
    tooltipCb.calls.reset();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should not create chart when canvas context is null (branch coverage) and handle animation.onComplete safely', () => {
    setCanvasContext(null);
    const opts = (component as any).options() as any;

    expect(() => opts.animation!.onComplete()).not.toThrow();

    fixture.detectChanges();
    expect(mockChartService.createLineChart).not.toHaveBeenCalled();

    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should create chart with provided inputs and wire options/handlers correctly', () => {
    const fakeCtx = {} as CanvasRenderingContext2D;
    setCanvasContext(fakeCtx);

    fixture.detectChanges();

    // verify createLineChart args
    expect(mockChartService.createLineChart).toHaveBeenCalledTimes(1);
    const { context, labels, datasets, options } =
      mockChartService.createLineChart.calls.mostRecent().args[0];

    expect(context).toBe(fakeCtx);
    expect(labels).toEqual(initialLabels);
    expect(datasets).toEqual(initialDatasets);

    expect(options.scales).toBe(initialScales);
    expect(options.plugins.tooltip.callbacks.label).toBe(tooltipCb);

    const style: any = { cursor: 'initial' };
    const evt: any = { native: { target: { style } } };
    options.plugins.legend.onHover(evt, {} as any, {} as any);
    expect(style.cursor).toBe('pointer');
    options.plugins.legend.onLeave(evt, {} as any, {} as any);
    expect(style.cursor).toBe('default');

    const fromFn = options.animations.y.from as (ctx: any) => number | undefined;
    const ctxObj = {
      type: 'data',
      mode: 'default',
      chart: { scales: { y: { getPixelForValue: (v: number) => 123 } } },
    } as any;
    expect(fromFn(ctxObj)).toBe(123);
    expect(fromFn(ctxObj)).toBeUndefined();

    // animation.onComplete should update chart.options.animation.duration to 800
    expect(options.animation.duration).toBe(1200);
    options.animation.onComplete(); // chart is defined now
    expect(lastChart.options.animation.duration).toBe(800);
  });

  it('should update chart when inputs change and preserve hidden state by dataset key', () => {
    const fakeCtx = {} as CanvasRenderingContext2D;
    setCanvasContext(fakeCtx);
    fixture.detectChanges();

    lastChart.getDatasetMeta = (i: number) => (i === 0 ? { hidden: null } : { hidden: true });

    const newLabels = ['NL1'];
    const newDatasets = [
      { label: 'A', data: [10], borderColor: 'red' } as any,
      { /* no label */ data: [20], borderColor: 'blue' } as any,
    ];

    fixture.componentRef.setInput('labels', newLabels);
    fixture.componentRef.setInput('datasets', newDatasets);
    fixture.detectChanges(); // trigger signal effect

    // Chart data must be updated
    expect(lastChart.data.labels).toEqual(newLabels);
    expect(lastChart.data.datasets.length).toBe(2);
    expect(lastChart.data.datasets[0]).toEqual(
      jasmine.objectContaining({ data: [10], borderColor: 'red', hidden: true }),
    );
    expect((lastChart.data.datasets[1] as any).hidden).toBeUndefined();
    expect(lastChart.update).toHaveBeenCalledWith('none');
  });

  it('should destroy chart on ngOnDestroy when chart exists', () => {
    const fakeCtx = {} as CanvasRenderingContext2D;
    setCanvasContext(fakeCtx);
    fixture.detectChanges();

    component.ngOnDestroy();
    expect(lastChart.destroy).toHaveBeenCalledTimes(1);
  });
});
