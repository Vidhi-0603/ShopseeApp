import { TestBed } from '@angular/core/testing';

import { Redirect } from './redirect';

describe('Redirect', () => {
  let service: Redirect;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Redirect);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
