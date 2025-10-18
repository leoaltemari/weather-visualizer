import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherService } from '@services/weather.service';

import { BehaviorSubject } from 'rxjs';

import { ForecastComponent } from './forecast.component';

describe('ForecastComponent', () => {
  let fixture: ComponentFixture<ForecastComponent>;
  let component: ForecastComponent;
  let forecastSubject: BehaviorSubject<any[] | null>;
  let mockWeatherService: { forecast$: BehaviorSubject<any[] | null> };

  beforeEach(async () => {
    forecastSubject = new BehaviorSubject<any[] | null>(null);
    mockWeatherService = { forecast$: forecastSubject };

    await TestBed.configureTestingModule({
      imports: [ForecastComponent],
      providers: [{ provide: WeatherService, useValue: mockWeatherService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    forecastSubject.complete();
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return empty rotations when forecast is null', () => {
    expect(component.windRotationByDay()).toEqual([]);
  });

  it('should map known wind directions to correct degrees', () => {
    const payload = [
      { windDirection: 'n' },
      { windDirection: 'no' },
      { windDirection: 'o' },
      { windDirection: 'zo' },
      { windDirection: 'z' },
    ];
    forecastSubject.next(payload);
    fixture.detectChanges();

    expect(component.windRotationByDay()).toEqual([0, 45, 90, 135, 180]);
  });

  it('should default to 0 when windDirection is missing or invalid', () => {
    const payload = [{}, { windDirection: 'invalid' }];
    forecastSubject.next(payload);
    fixture.detectChanges();

    expect(component.windRotationByDay()).toEqual([0, 0]);
  });

  it('should react to subsequent emissions and update rotations', () => {
    const first = [{ windDirection: 'n' }, { windDirection: 'no' }, { windDirection: 'o' }];
    forecastSubject.next(first);
    fixture.detectChanges();
    expect(component.windRotationByDay()).toEqual([0, 45, 90]);

    const second = [{ windDirection: 'w' }];
    forecastSubject.next(second);
    fixture.detectChanges();
    expect(component.windRotationByDay()).toEqual([270]);
  });

  it('should expose the latest forecast value through forecastSignal', () => {
    const payload = [{ windDirection: 'wzw' }, { windDirection: 'nw' }] as any;
    forecastSubject.next(payload);
    fixture.detectChanges();

    expect(component.forecastSignal()).toBe(payload);
  });
});
