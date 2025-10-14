import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { ForecastService } from '@services/forecast.service';

@Component({
  selector: 'app-forecast',
  standalone: true,
  imports: [CommonModule],
  providers: [ForecastService],
  templateUrl: './forecast.component.html',
})
export class ForecastComponent {
  private readonly forecastService = inject(ForecastService);

  readonly forecast = this.forecastService.get5DayRealtimeForecast();
}
