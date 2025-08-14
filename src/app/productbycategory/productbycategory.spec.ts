import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Productbycategory } from './productbycategory';

describe('Productbycategory', () => {
  let component: Productbycategory;
  let fixture: ComponentFixture<Productbycategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Productbycategory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Productbycategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
