import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <main class="min-h-screen" style="background-color: #26323d;">
      <router-outlet></router-outlet>
    </main>
  `,
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
