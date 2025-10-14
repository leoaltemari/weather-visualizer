import { CommonModule } from '@angular/common';
import { Component, inject, model } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FOCUS_MAP_ZOOM } from '@constants/map.constant';
import { Station } from '@models/buienradar-api.model';
import { Position } from '@models/map.model';
import { VisualizationType } from '@models/weather.model';
import { MapControlService } from '@services/map-control.service';
import { MapService } from '@services/map.service';
import { WeatherService } from '@services/weather.service';

@Component({
  selector: 'app-map-controls',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './map-controls.component.html',
})
export class MapControlsComponent {
  private readonly weatherService = inject(WeatherService);
  private readonly mapControlService = inject(MapControlService);
  private readonly mapService = inject(MapService);

  readonly stations = toSignal(this.weatherService.stations$);

  readonly selectedStation = model<Station | null>(null);
  readonly selectedVisualization = model<VisualizationType>(VisualizationType.temperature);

  isRefreshing = false;

  onStationSelect(selectEvent: Event): void {
    const id = +(selectEvent.target as HTMLSelectElement).value;
    const station = this.weatherService.getStationDataById(id);

    if (!station) {
      this.mapService.resetMap();
      return;
    }

    this.mapControlService.setSelectedStation(station);

    const stationPosition = [station.lat, station.lon] as Position;

    this.mapService.flyTo(stationPosition, FOCUS_MAP_ZOOM);
    this.mapService.openPopupAt(stationPosition);
  }

  onVisualizationTypeSelect(selectEvent: Event): void {
    const type =
      ((selectEvent.target as HTMLSelectElement).value as VisualizationType) ??
      VisualizationType.temperature;

    this.mapControlService.setVisualizationType(type);

    this.mapService.updateMarkers(this.stations()!, type);
  }

  onReset(): void {
    this.selectedStation.set(null);
    this.mapControlService.setSelectedStation(null);

    this.selectedVisualization.set(VisualizationType.temperature);
    this.mapControlService.setVisualizationType(VisualizationType.temperature);

    this.mapService.resetMap();
    this.mapService.updateMarkers(this.stations()!, VisualizationType.temperature);
  }

  onRefresh(): void {
    if (this.isRefreshing) return;

    this.isRefreshing = true;
    setTimeout(() => (this.isRefreshing = false), 1000);

    this.weatherService.getRealTimeStationData().subscribe();
  }
}
