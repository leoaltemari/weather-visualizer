import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherService } from '@services/weather.service';

import { Observable, of } from 'rxjs';

import { WeatherDashboardComponent } from './weather-dashboard.component';

describe('WeatherDashboardComponent', () => {
  let fixture: ComponentFixture<WeatherDashboardComponent>;
  let component: WeatherDashboardComponent;
  let weatherServiceMock: {
    error$: Observable<string | null>;
    enablePooling: boolean;
    getRealTimeWeatherData: jasmine.Spy;
    clearError: jasmine.Spy;
  };

  beforeEach(async () => {
    const initialStream = of({ initial: true });
    const retryStream = of({ retry: true });
    const errorStream = of('error');

    weatherServiceMock = {
      error$: errorStream,
      enablePooling: false,
      getRealTimeWeatherData: jasmine
        .createSpy('getRealTimeWeatherData')
        .and.returnValues(initialStream, retryStream),
      clearError: jasmine.createSpy('clearError'),
    };

    await TestBed.configureTestingModule({
      imports: [WeatherDashboardComponent],
    })
      .overrideComponent(WeatherDashboardComponent, {
        set: {
          template: '',
          providers: [{ provide: WeatherService, useValue: weatherServiceMock }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WeatherDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize weatherData$ from WeatherService on creation', () => {
    expect(weatherServiceMock.getRealTimeWeatherData).toHaveBeenCalledTimes(1);
    const firstCallReturn = weatherServiceMock.getRealTimeWeatherData.calls.first().returnValue;
    expect(component.weatherData$).toBe(firstCallReturn);
  });

  it('should expose error$ from WeatherService', () => {
    expect(component.error$).toBe(weatherServiceMock.error$);
  });

  it('should clear error, enable pooling and request new data on retryFetch', () => {
    component.retryFetch();
    expect(weatherServiceMock.clearError).toHaveBeenCalledTimes(1);
    expect(weatherServiceMock.enablePooling).toBeTrue();
    expect(weatherServiceMock.getRealTimeWeatherData).toHaveBeenCalledTimes(2);
    const secondCallReturn =
      weatherServiceMock.getRealTimeWeatherData.calls.mostRecent().returnValue;
    expect(component.weatherData$).toBe(secondCallReturn);
  });

  it('should disable pooling on destroy', () => {
    weatherServiceMock.enablePooling = true;
    component.ngOnDestroy();
    expect(weatherServiceMock.enablePooling).toBeFalse();
  });
});
