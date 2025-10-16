import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { MapControlService } from '@services/map-control.service';
import { MapService } from '@services/map.service';
import { WeatherService } from '@services/weather.service';

@Component({
  selector: 'app-map',
  imports: [CommonModule],
  host: {
    class: 'bg-gray-800/90 rounded-2xl shadow-xl border-1 border-blue-500 h-[300px] md:h-full',
  },
  template: `<article id="map" class="rounded-2xl" style="height: 100%; width: 100%"></article>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent {
  private readonly mapControlService = inject(MapControlService);
  private readonly mapService = inject(MapService);
  private readonly weatherService = inject(WeatherService);

  private readonly stations = toSignal(this.weatherService.stations$);
  private readonly selectecVisualizationType = toSignal(this.mapControlService.visualizationType$);
  private readonly heatmapEnabled = toSignal(this.mapControlService.heatmapEnabled$);

  // Track when the map is created so the `syncMap` effect doesn't run prematurely
  private readonly mapCreated = signal(false);

  // React to changes in all relevant inputs and update the map accordingly
  private readonly syncMap = effect(() => {
    const stations = this.stations();
    const type = this.selectecVisualizationType();
    const heatmap = this.heatmapEnabled();
    const mapReady = this.mapCreated();

    if (!mapReady || !stations || !type) return;

    if (heatmap) {
      this.mapService.updateHeatmap(stations, type);
    } else {
      this.mapService.updateMarkers(stations, type);
    }
  });

  ngAfterViewInit(): void {
    this.mapService.createMap();
    this.mapCreated.set(true);
  }
}
