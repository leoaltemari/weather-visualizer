import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { TitleComponent } from '@components/title/title.component';
import { cardinalDirectionsToNumberMap } from '@constants/map.constant';
import { WeatherService } from '@services/weather.service';

@Component({
  selector: 'app-forecast',
  imports: [CommonModule, TitleComponent],
  host: { class: 'flex flex-col' },
  templateUrl: './forecast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForecastComponent {
  private readonly weatherService = inject(WeatherService);

  readonly forecastSignal = toSignal(this.weatherService.forecast$);

  /** Array with each of the five day forecast wind rotation, to apply a rotation at the icon to where the wind is 'pointing' */
  readonly windRotationByDay = computed(() => {
    const forecast = this.forecastSignal();

    if (!forecast) return [];

    return forecast.map((item) => cardinalDirectionsToNumberMap[item?.windDirection] ?? 0);
  });
}
