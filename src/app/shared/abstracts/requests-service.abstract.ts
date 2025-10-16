import {
  DEFAULT_ERROR_MESSAGE,
  defaultErrorMessageByStatusCode,
} from '@constants/requests.constant';

import { BehaviorSubject } from 'rxjs';

export abstract class RequestsServiceBase {
  protected readonly _error$ = new BehaviorSubject<string | null>(null);
  readonly error$ = this._error$.asObservable();

  /** Controls when the pooling must stop */
  protected _enablePooling = true;
  set enablePooling(value: boolean) {
    this._enablePooling = value;
  }

  protected getErrorMessage(status: number): string {
    return defaultErrorMessageByStatusCode[status] ?? DEFAULT_ERROR_MESSAGE;
  }

  public clearError(): void {
    this._error$.next(null);
  }
}
