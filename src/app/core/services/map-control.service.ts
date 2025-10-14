import { Injectable } from '@angular/core';

import { Station } from '@models/buienradar-api.model';
import { VisualizationType } from '@models/weather.model';

import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MapControlService {
  private readonly _selectedStation$ = new BehaviorSubject<Station | null>(null);
  readonly selectedStation$ = this._selectedStation$.asObservable();

  private readonly visualizationType$ = new BehaviorSubject<VisualizationType>(
    VisualizationType.temperature,
  );
  readonly visualizationTypeObservable$ = this.visualizationType$.asObservable();

  public setSelectedStation(station: Station | null): void {
    this._selectedStation$.next(station);
  }

  public setVisualizationType(type: VisualizationType): void {
    this.visualizationType$.next(type);
  }
}
