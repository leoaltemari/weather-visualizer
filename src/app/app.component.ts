import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <main class="h-screen" style="background-color: #26323d;">
      <router-outlet></router-outlet>
    </main>
  `,
  imports: [RouterModule],
})
export class AppComponent {}
