import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartService } from '@services/chart.service';
import { WeatherService } from '@services/weather.service';

import { of } from 'rxjs';

import { ForecastChartComponent } from './forecast-chart.component';

describe('ForecastChartComponent', () => {
  let fixture: ComponentFixture<ForecastChartComponent>;
  let component: ForecastChartComponent;
  let createLineDatasetSpy: jasmine.Spy;

  beforeEach(() => {
    const mockWeatherService = {
      get3LettersDayforecast: jasmine
        .createSpy('get3LettersDayforecast')
        .and.returnValue(of(['Mon', 'Tue'])),
      getMinTemperatureForecast: jasmine
        .createSpy('getMinTemperatureForecast')
        .and.returnValue(of([1, 2])),
      getMaxTemperatureForecast: jasmine
        .createSpy('getMaxTemperatureForecast')
        .and.returnValue(of([3, 4])),
      getRainChanceForecast: jasmine
        .createSpy('getRainChanceForecast')
        .and.returnValue(of([10, 20])),
    };

    createLineDatasetSpy = spyOn(ChartService.prototype, 'createLineDataset').and.callFake(
      (config) => {
        return { label: config.label, data: config.data, yAxisID: config.yAxisID };
      },
    );

    TestBed.overrideComponent(ForecastChartComponent, { set: { template: '' } });

    TestBed.configureTestingModule({
      imports: [ForecastChartComponent],
      providers: [{ provide: WeatherService, useValue: mockWeatherService }],
    });

    fixture = TestBed.createComponent(ForecastChartComponent);
    component = fixture.componentInstance;
  });

  it('should create and expose labels', () => {
    expect(component).toBeTruthy();
    expect(component.labels()).toEqual(['Mon', 'Tue']);
  });

  it('should format tick callbacks for y and y2 axes', () => {
    const formattedDegree = (component.chartScales!['y']!.ticks!.callback as any)(10);
    const formattedPercent = (component.chartScales!['y2']!.ticks!.callback as any)(50);
    expect(formattedDegree).toBe('10°');
    expect(formattedPercent).toBe('50%');
    expect(component.chartScales!['y']!.suggestedMax).toBe(35);
    expect(component.chartScales!['y']!.suggestedMin).toBe(-25);
    expect(component.chartScales!['y2']!.suggestedMax).toBe(100);
  });

  it('should build datasets with correct configuration', () => {
    component.maxTemperatureDataset();
    component.minTemperatureDataset();
    component.rainChanceDataset();

    expect(createLineDatasetSpy).toHaveBeenCalledTimes(3);

    const callArgs = createLineDatasetSpy.calls.allArgs().map((args) => args[0]);

    expect(callArgs[0]).toEqual(
      jasmine.objectContaining({
        label: 'Max Temp (°C)',
        yAxisID: 'y',
        data: [3, 4],
        color: jasmine.objectContaining({
          main: 'rgb(239, 68, 68)',
          areaGradient: jasmine.objectContaining({
            start: 'rgba(239,68,68,0.30)',
            midle: 'rgba(239,68,68,0.15)',
            end: 'rgba(239,68,68,0.00)',
          }),
        }),
      }),
    );

    expect(callArgs[1]).toEqual(
      jasmine.objectContaining({
        label: 'Min Temp (°C)',
        yAxisID: 'y',
        data: [1, 2],
        color: jasmine.objectContaining({
          main: 'rgb(59, 130, 246)',
          areaGradient: jasmine.objectContaining({
            start: 'rgba(59,130,246,0.30)',
            midle: 'rgba(59,130,246,0.15)',
            end: 'rgba(59,130,246,0.00)',
          }),
        }),
      }),
    );

    expect(callArgs[2]).toEqual(
      jasmine.objectContaining({
        label: 'Rain Chance (%)',
        yAxisID: 'y2',
        data: [10, 20],
        color: jasmine.objectContaining({
          main: 'rgb(16, 185, 129)',
          areaGradient: jasmine.objectContaining({
            start: 'rgba(16,185,129,0.30)',
            midle: 'rgba(16,185,129,0.15)',
            end: 'rgba(16,185,129,0.00)',
          }),
        }),
      }),
    );
  });

  it('should format tooltip labels for both axes', () => {
    const tempTooltip = component.chartTooltipLabelCallback.call(
      {} as any,
      {
        dataset: { label: 'Max Temp (°C)', yAxisID: 'y' },
        parsed: { y: 21 },
      } as any,
    );
    const rainTooltip = component.chartTooltipLabelCallback.call(
      {} as any,
      {
        dataset: { yAxisID: 'y2' },
        parsed: { y: 65 },
      } as any,
    );

    expect(tempTooltip).toBe('Max Temp (°C): 21°C');
    expect(rainTooltip).toBe(': 65%');
  });
});
