import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { WeatherService } from '@services/weather.service';

@Component({
  selector: 'app-forecast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forecast.component.html',
})
export class ForecastComponent {
  private readonly weatherService = inject(WeatherService);

  readonly forecastSignal = toSignal(this.weatherService.forecast$);
}
