import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { MapControlService } from '@services/map-control.service';
import { MapService } from '@services/map.service';
import { WeatherService } from '@services/weather.service';

import { MapControlsComponent } from './map-controls/map-controls.component';
import { MapViewComponent } from './map-view/map-view.component';

@Component({
  selector: 'app-map',
  standalone: true,
  providers: [WeatherService, MapControlService, MapService],
  imports: [CommonModule, MapViewComponent, MapControlsComponent],
  templateUrl: './map.component.html',
})
export class MapComponent {
  readonly weatherService = inject(WeatherService);

  readonly stations$ = this.weatherService.getStationsData();
}
