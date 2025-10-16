import { Component } from '@angular/core';

import { LoadingSpinnerComponent } from '@components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-loading',
  imports: [LoadingSpinnerComponent],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
})
export class LoadingComponent {}
