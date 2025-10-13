import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { MapControlService } from '@services/map-control.service';
import { MapService } from '@services/map.service';
import { WeatherService } from '@services/weather.service';

import { MapControlsComponent } from './routes/map/map-controls/map-controls.component';
import { MapComponent } from './routes/map/map.component';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [WeatherService, MapControlService, MapService],
  imports: [CommonModule, MapComponent, MapControlsComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly weatherService = inject(WeatherService);

  readonly stations$ = this.weatherService.getStationsData();
}
