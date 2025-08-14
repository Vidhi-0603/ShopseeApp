import { TestBed } from '@angular/core/testing';

import { DisplayProducts } from './display-products';

describe('DisplayProducts', () => {
  let service: DisplayProducts;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DisplayProducts);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
