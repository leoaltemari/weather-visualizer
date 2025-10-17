import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-error-card',
  host: {
    class: 'flex items-center justify-center p-8',
  },
  templateUrl: './error-card.component.html',
  styleUrl: './error-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorCardComponent {
  readonly errorMessage = input<string>();
  readonly tryAgainFunction = input<VoidFunction>();
}
