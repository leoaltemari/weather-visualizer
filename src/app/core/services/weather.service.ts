import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { BuienradarApiResponse, Station } from '@models/buienradar-api.model';

import { environment } from 'environments/environment.prod';
import {
  BehaviorSubject,
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
export class WeatherService {
  private readonly http = inject(HttpClient);

  private readonly WEATHER_API_URL = environment.buienradarUrl;
  private readonly REFRESH_INTERVAL = 30 * 1000; // 30 seconds

  private readonly _stations$ = new BehaviorSubject<Station[]>([]);
  readonly stations$ = this._stations$.asObservable();

  private _enablePooling = true;

  public getWeatherData(): Observable<BuienradarApiResponse> {
    return this.http.get<BuienradarApiResponse>(this.WEATHER_API_URL).pipe(retry(3));
  }

  public getRealTimeWeatherData(
    refreshIntervalMs = this.REFRESH_INTERVAL,
  ): Observable<BuienradarApiResponse> {
    return timer(0, refreshIntervalMs).pipe(
      takeWhile(() => this._enablePooling),
      switchMap(() => this.getWeatherData()),
      shareReplay(1),
    );
  }

  public getStationsData(): Observable<Station[]> {
    return this.getWeatherData().pipe(
      map((data) => data.actual.stationmeasurements ?? []),
      tap((stations) => this._stations$.next(stations)),
    );
  }

  public getRealTimeStationData(refreshIntervalMs = this.REFRESH_INTERVAL): Observable<Station[]> {
    return timer(0, refreshIntervalMs).pipe(
      takeWhile(() => this._enablePooling),
      switchMap(() => this.getStationsData()),
      shareReplay(1),
    );
  }

  public stopPooling(): void {
    this._enablePooling = false;
  }

  public getStationDataById(stationId: number): Station | null {
    return this._stations$.value.find((station) => station.stationid === stationId) ?? null;
  }
}
