import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';

import { MapControlService } from '@services/map-control.service';
import { MapService } from '@services/map.service';
import { WeatherService } from '@services/weather.service';

import { ForecastChartComponent } from './forecast-chart/forecast-chart.component';
import { ForecastComponent } from './forecast/forecast.component';
import { MapControlsComponent } from './map-controls/map-controls.component';
import { MapComponent } from './map/map.component';
import { StationDataComponent } from './station-data.component/station-data.component';

@Component({
  selector: 'app-weather-dashboard',
  providers: [WeatherService, MapControlService, MapService],
  imports: [
    CommonModule,
    MapComponent,
    MapControlsComponent,
    StationDataComponent,
    ForecastComponent,
    ForecastChartComponent,
  ],
  host: {
    class: 'container mx-auto flex flex-col gap-[24px] md:px-4 py-[32px] h-full',
  },
  templateUrl: './weather-dashboard.component.html',
})
export class WeatherDashboardComponent implements OnDestroy {
  readonly weatherService = inject(WeatherService);

  readonly weatherData$ = this.weatherService.getRealTimeWeatherData();

  ngOnDestroy(): void {
    this.weatherService.stopPooling();
  }
}
