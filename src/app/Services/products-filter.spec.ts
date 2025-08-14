import { TestBed } from '@angular/core/testing';

import { ProductsFilter } from './products-filter';

describe('ProductsFilter', () => {
  let service: ProductsFilter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductsFilter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
