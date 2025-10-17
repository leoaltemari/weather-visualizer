import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-title',
  template: `
    <div class="mb-6 pb-4 border-b border-blue-500/30">
      <div class="flex items-center gap-3">
        <span class="text-3xl">{{ icon() }}</span>
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-100 mb-1">{{ title() }}</h2>
          <p class="text-sm text-gray-400">{{ subtitle() }}</p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleComponent {
  readonly title = input.required<string>();
  readonly icon = input<string>();
  readonly subtitle = input<string>();
}
