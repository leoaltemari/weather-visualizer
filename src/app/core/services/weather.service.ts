import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { RequestsServiceBase } from '@abstracts/requests-service.abstract';
import { environment } from '@env';
import {
  BuienradarApiResponse,
  BuienradarGraphQLResponse,
  Station,
} from '@models/buienradar-api.model';
import { WEATHER_QUERY } from '@queries/weather-query.graphql';

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

  private readonly GRAPHQL_API_URL = environment.buienradarApiUrl;
  private readonly REFRESH_INTERVAL = 5 * 1000; // 5 seconds

  private readonly _weatherData$ = new BehaviorSubject<BuienradarApiResponse | null>(null);

  readonly stations$ = this._weatherData$.pipe(
    map((data) => data?.actual?.stationmeasurements ?? []),
  );
  readonly forecast$ = this._weatherData$.pipe(
    map((data) => data?.forecast?.fivedayforecast ?? []),
  );

  public getWeatherData(): Observable<BuienradarApiResponse> {
    const body = { query: WEATHER_QUERY };

    return this.http.post<BuienradarGraphQLResponse>(this.GRAPHQL_API_URL, body).pipe(
      retry({ count: 3, delay: 500 }),
      map((res) => res.data.weatherData),
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

  /**
   * Retrieves the three-letter weekday abbreviations for the five-day weather forecast.
   * Transforms forecast dates into short weekday names (e.g., "Mon", "Tue", "Wed").
   *
   * @returns Observable emitting an array of three-letter weekday abbreviations
   *
   * @example
   * ```typescript
   * // Subscribe to get weekday labels for chart x-axis
   * this.weatherService.get3LettersDayforecast().subscribe(days => {
   *   console.log(days);
   *   // Output: ["Mon", "Tue", "Wed", "Thu", "Fri"]
   * });
   * ```
   */
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
