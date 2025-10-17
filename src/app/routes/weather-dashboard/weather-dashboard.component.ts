import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';

import { ErrorCardComponent } from '@components/error-card/error-card.component';
import { LoadingSpinnerComponent } from '@components/loading-spinner/loading-spinner.component';
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
    LoadingSpinnerComponent,
    ErrorCardComponent,
  ],
  host: {
    class: 'container mx-auto flex flex-col gap-[24px] md:px-4 py-[32px] h-full',
  },
  templateUrl: './weather-dashboard.component.html',
  styleUrls: ['./weather-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherDashboardComponent implements OnDestroy {
  readonly weatherService = inject(WeatherService);

  weatherData$ = this.weatherService.getRealTimeWeatherData();
  readonly error$ = this.weatherService.error$;

  retryFetch(): void {
    this.weatherService.clearError();
    this.weatherService.enablePooling = true;
    this.weatherData$ = this.weatherService.getRealTimeWeatherData();
  }

  ngOnDestroy(): void {
    this.weatherService.enablePooling = false;
  }
}
