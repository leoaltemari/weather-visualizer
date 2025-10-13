import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { BuienradarApiResponse, Station } from '@models/buienradar-api.model';

import { environment } from 'environments/environment.prod';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

@Injectable()
export class WeatherService {
  private readonly http = inject(HttpClient);

  private readonly WEATHER_API_URL = environment.buienradarUrl;

  private readonly _stations$ = new BehaviorSubject<Station[]>([]);
  readonly stations$ = this._stations$.asObservable();

  public getStationsData(): Observable<Station[]> {
    return this.http.get<BuienradarApiResponse>(this.WEATHER_API_URL).pipe(
      map((data) => data.actual.stationmeasurements ?? []),
      tap((stations) => this._stations$.next(stations)),
    );
  }

  public getStationDataById(stationId: number): Station | null {
    return this._stations$.value.find((station) => station.stationid === stationId) ?? null;
  }
}
