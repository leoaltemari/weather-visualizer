import { inject, Injectable } from '@angular/core';

import { WeatherForecast } from '@models/buienradar-api.model';

import { BehaviorSubject, map, Observable, tap } from 'rxjs';

import { WeatherService } from './weather.service';

@Injectable()
export class ForecastService {
  private readonly weatherService = inject(WeatherService);

  private readonly _forecast$ = new BehaviorSubject<WeatherForecast[]>([]);
  readonly forecast$ = this._forecast$.asObservable();

  public get5DayRealtimeForecast(): Observable<WeatherForecast[]> {
    return this.weatherService.getRealTimeWeatherData().pipe(
      map((data) => data.forecast.fivedayforecast),
      tap((forecast) => this._forecast$.next(forecast)),
    );
  }
}
