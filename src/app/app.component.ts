import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <main class="bg-gray-200 h-screen">
      <router-outlet></router-outlet>
    </main>
  `,
  imports: [RouterModule],
})
export class AppComponent {}
