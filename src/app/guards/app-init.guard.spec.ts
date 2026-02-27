import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { appInitGuard } from './app-init.guard';

describe('appInitGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => appInitGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
