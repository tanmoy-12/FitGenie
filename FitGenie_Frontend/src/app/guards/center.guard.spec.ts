import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { centerGuard } from './center.guard';

describe('centerGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => centerGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
