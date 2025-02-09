import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { openGuard } from './open.guard';

describe('openGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => openGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
