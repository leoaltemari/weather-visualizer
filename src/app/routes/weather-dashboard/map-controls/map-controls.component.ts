import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { FOCUS_MAP_ZOOM } from '@constants/map.constant';
import { Position } from '@models/map.model';
import { VisualizationType } from '@models/weather.model';
import { MapControlService } from '@services/map-control.service';
import { MapService } from '@services/map.service';
import { WeatherService } from '@services/weather.service';

@Component({
  selector: 'app-map-controls',
  imports: [CommonModule],
  host: {
    class: 'bg-gray-800/90 rounded-2xl px-5 p-3 shadow-xl border-1 border-blue-500',
  },
  templateUrl: './map-controls.component.html',
})
export class MapControlsComponent {
  private readonly weatherService = inject(WeatherService);
  private readonly mapControlService = inject(MapControlService);
  private readonly mapService = inject(MapService);

  readonly stations = toSignal(this.weatherService.stations$);
  readonly selectedStation = toSignal(this.mapControlService.selectedStation$);
  readonly selectedVisualizationType = toSignal(this.mapControlService.visualizationType$);

  readonly isRefreshing = signal(false);

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
    const type = (selectEvent.target as HTMLSelectElement).value as VisualizationType;

    this.mapControlService.setVisualizationType(type);

    this.mapService.updateMarkers(this.stations()!, type);
  }

  onReset(): void {
    this.mapControlService.setSelectedStation(null);
    this.mapControlService.setVisualizationType(VisualizationType.temperature);

    this.mapService.resetMap();
    this.mapService.updateMarkers(this.stations()!, VisualizationType.temperature);
  }

  onRefresh(): void {
    if (this.isRefreshing()) return;

    this.isRefreshing.set(true);
    setTimeout(() => this.isRefreshing.set(false), 1000);

    this.weatherService.getWeatherData().subscribe();
  }
}
