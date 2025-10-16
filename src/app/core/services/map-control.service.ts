import { inject, Injectable } from '@angular/core';

import { Station } from '@models/buienradar-api.model';
import { VisualizationType } from '@models/weather.model';
import { WeatherService } from '@services/weather.service';

import { BehaviorSubject, combineLatest, map } from 'rxjs';

@Injectable()
export class MapControlService {
  private readonly weatherService = inject(WeatherService);

  private readonly _selectedStationId$ = new BehaviorSubject<number | null>(null);

  /** Selected station will always be based on stations$ observable so it gets updated value always */
  readonly selectedStation$ = combineLatest([
    this._selectedStationId$,
    this.weatherService.stations$,
  ]).pipe(map(([id, stations]) => stations.find((station) => station.stationid === id) ?? null));

  private readonly _visualizationType$ = new BehaviorSubject<VisualizationType>(
    VisualizationType.temperature,
  );
  readonly visualizationType$ = this._visualizationType$.asObservable();

  private readonly _heatmapEnabled$ = new BehaviorSubject<boolean>(false);
  readonly heatmapEnabled$ = this._heatmapEnabled$.asObservable();

  public setSelectedStation(station: Station | null): void {
    this._selectedStationId$.next(station?.stationid ?? null);
  }

  public setVisualizationType(type: VisualizationType): void {
    this._visualizationType$.next(type);
  }

  public setHeatmapEnabled(enabled: boolean): void {
    this._heatmapEnabled$.next(enabled);
  }
}
