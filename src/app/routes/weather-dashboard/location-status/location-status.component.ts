import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { MapControlService } from '@services/map-control.service';

@Component({
  selector: 'app-location-status',
  standalone: true,
  host: {
    class: `rounded-2xl bg-cover bg-center bg-[url('/images/backgrounds/weather-default.png')]`,
  },
  imports: [CommonModule],
  templateUrl: './location-status.component.html',
})
export class LocationStatusComponent {
  private readonly mapControlService = inject(MapControlService);

  readonly selectedStation = toSignal(this.mapControlService.selectedStation$);
}
