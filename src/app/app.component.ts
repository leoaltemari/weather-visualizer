import { Component } from '@angular/core';

import { MapComponent } from './routes/map/map.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MapComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
