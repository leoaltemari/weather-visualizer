import {
  DEFAULT_ERROR_MESSAGE,
  defaultErrorMessageByStatusCode,
} from '@constants/requests.constant';

import { RequestsServiceBase } from './requests-service.abstract';

class TestRequestsService extends RequestsServiceBase {
  public setError(message: string) {
    this._error$.next(message);
  }

  public resolveMessage(status: number) {
    return this.getErrorMessage(status);
  }

  public get poolingEnabled() {
    return this._enablePooling;
  }
}

describe('RequestsServiceBase (abstract)', () => {
  let service: TestRequestsService;

  beforeEach(() => {
    service = new TestRequestsService();
  });

  it('error$: emits null initially, then error, then null after clearError()', () => {
    const emissions: (string | null)[] = [];
    const sub = service.error$.subscribe((v) => emissions.push(v));

    // Initial emission from BehaviorSubject
    expect(emissions).toEqual([null]);

    // Set error and then clear
    service.setError('boom');
    service.clearError();

    expect(emissions).toEqual([null, 'boom', null]);
    sub.unsubscribe();
  });

  it('enablePooling: toggles internal flag via setter', () => {
    expect(service.poolingEnabled).toBeTrue();
    service.enablePooling = false;
    expect(service.poolingEnabled).toBeFalse();
    service.enablePooling = true;
    expect(service.poolingEnabled).toBeTrue();
  });

  it('getErrorMessage: returns DEFAULT_ERROR_MESSAGE for unmapped status', () => {
    const unknownStatus = 999999;
    expect(service.resolveMessage(unknownStatus)).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it('getErrorMessage: returns mapped message when status exists in constants', () => {
    const keys = Object.keys(defaultErrorMessageByStatusCode);
    if (keys.length === 0) {
      pending('No entries in defaultErrorMessageByStatusCode to assert mapped case');
      return;
    }
    const status = Number(keys[0]);
    const expected = defaultErrorMessageByStatusCode[status];
    expect(service.resolveMessage(status)).toBe(expected);
  });
});
