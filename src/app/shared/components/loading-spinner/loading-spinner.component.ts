import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="relative" [style]="sizeClass()">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="loading-icon">{{ icon() }}</div>
    </div>
  `,
  imports: [CommonModule],
  styleUrl: './loading-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  readonly size = input<number>(120);
  readonly icon = input<string>('🌤️');

  readonly sizeClass = computed(() => `height: ${this.size()}px; width: ${this.size()}px;`);
}
