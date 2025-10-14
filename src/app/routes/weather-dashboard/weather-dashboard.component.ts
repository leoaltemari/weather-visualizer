import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { MapControlService } from '@services/map-control.service';
import { MapService } from '@services/map.service';
import { WeatherService } from '@services/weather.service';

import { LocationStatusComponent } from './location-status/location-status.component';
import { MapControlsComponent } from './map-controls/map-controls.component';
import { MapComponent } from './map/map.component';

@Component({
  selector: 'app-weather-dashboard',
  standalone: true,
  providers: [WeatherService, MapControlService, MapService],
  imports: [CommonModule, MapComponent, MapControlsComponent, LocationStatusComponent],
  templateUrl: './weather-dashboard.component.html',
})
export class WeatherDashboardComponent {
  readonly weatherService = inject(WeatherService);

  readonly stations$ = this.weatherService.getRealTimeStationData();
}
