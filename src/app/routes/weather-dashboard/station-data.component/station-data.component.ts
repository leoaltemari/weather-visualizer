import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { MapControlService } from '@services/map-control.service';

@Component({
  selector: 'app-station-data',
  host: {
    class: `bg-gray-800/90 backdrop-blur-xl rounded-2xl px-6 py-5 shadow-xl border-1 border-blue-500 h-full`,
  },
  imports: [CommonModule],
  templateUrl: './station-data.component.html',
})
export class StationDataComponent {
  private readonly mapControlService = inject(MapControlService);

  readonly selectedStation = toSignal(this.mapControlService.selectedStation$);
}
