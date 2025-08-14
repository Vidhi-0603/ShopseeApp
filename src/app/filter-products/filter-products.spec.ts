import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterProducts } from './filter-products';

describe('FilterProducts', () => {
  let component: FilterProducts;
  let fixture: ComponentFixture<FilterProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterProducts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterProducts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
