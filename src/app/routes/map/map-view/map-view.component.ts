import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { MapControlService } from '@services/map-control.service';
import { MapService } from '@services/map.service';
import { WeatherService } from '@services/weather.service';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-view.component.html',
})
export class MapViewComponent implements AfterViewInit {
  private readonly mapControlService = inject(MapControlService);
  private readonly mapService = inject(MapService);
  private readonly weatherService = inject(WeatherService);

  private readonly stations = toSignal(this.weatherService.stations$);
  readonly selectecVisualizationType = toSignal(
    this.mapControlService.visualizationTypeObservable$,
  );

  ngAfterViewInit(): void {
    this.mapService.createMap();
    this.mapService.updateMarkers(this.stations()!, this.selectecVisualizationType()!);
  }
}
