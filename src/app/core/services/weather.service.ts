import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { RequestsServiceBase } from '@abstracts/requests-service.abstract';
import { environment } from '@env';
import { BuienradarApiResponse, Station } from '@models/buienradar-api.model';

import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  retry,
  shareReplay,
  switchMap,
  takeWhile,
  tap,
  timer,
} from 'rxjs';

@Injectable()
export class WeatherService extends RequestsServiceBase {
  private readonly http = inject(HttpClient);

  private readonly WEATHER_API_URL = environment.buienradarUrl;
  private readonly REFRESH_INTERVAL = 30 * 1000; // 30 seconds

  private readonly _weatherData$ = new BehaviorSubject<BuienradarApiResponse | null>(null);

  readonly stations$ = this._weatherData$.pipe(
    map((data) => data?.actual?.stationmeasurements ?? []),
  );
  readonly forecast$ = this._weatherData$.pipe(
    map((data) => data?.forecast?.fivedayforecast ?? []),
  );

  public getWeatherData(): Observable<BuienradarApiResponse> {
    return this.http.get<BuienradarApiResponse>(this.WEATHER_API_URL).pipe(
      retry({ count: 3, delay: 500 }),
      tap((data) => {
        this._weatherData$.next(data);
        this._error$.next(null);
      }),
      catchError((error) => {
        const errorMessage = this.getErrorMessage(error.status);
        this._error$.next(errorMessage);

        throw error;
      }),
    );
  }

  public getRealTimeWeatherData(): Observable<BuienradarApiResponse> {
    return timer(0, this.REFRESH_INTERVAL).pipe(
      takeWhile(() => this._enablePooling),
      switchMap(() => this.getWeatherData()),
      shareReplay(1),
    );
  }

  public getStationDataById(stationId: number): Station | null {
    const stations = this._weatherData$.value?.actual?.stationmeasurements;

    return stations?.find((station) => station.stationid === stationId) ?? null;
  }

  public get3LettersDayforecast(): Observable<string[]> {
    return this.forecast$.pipe(
      map((forecasts) =>
        forecasts.map((forecast) =>
          new Date(forecast.day).toLocaleDateString('en-US', { weekday: 'short' }),
        ),
      ),
    );
  }

  public getMaxTemperatureForecast(): Observable<number[]> {
    return this.forecast$.pipe(
      map((forecasts) => forecasts.map((forecast) => +forecast.maxtemperatureMax)),
    );
  }

  public getMinTemperatureForecast(): Observable<number[]> {
    return this.forecast$.pipe(
      map((forecasts) => forecasts.map((forecast) => +forecast.mintemperatureMin)),
    );
  }

  public getRainChanceForecast(): Observable<number[]> {
    return this.forecast$.pipe(
      map((forecasts) => forecasts.map((forecast) => forecast.rainChance)),
    );
  }
}
