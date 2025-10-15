import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-dots',
  template: `
    <div class="loading-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `,
  styleUrl: './loading-dots.component.scss',
})
export class LoadingDotsComponent {}
