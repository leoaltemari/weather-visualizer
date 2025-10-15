import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="relative h-[{{ size() }}}px] w-[{{ size() }}px]">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="loading-icon">{{ icon() }}</div>
    </div>
  `,
  styleUrl: './loading-spinner.component.scss',
})
export class LoadingSpinnerComponent {
  readonly size = input<number>(120);
  readonly icon = input<string>('🌤️');
}
