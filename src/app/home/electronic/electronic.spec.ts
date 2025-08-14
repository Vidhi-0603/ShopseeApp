import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Electronic } from './electronic';

describe('Electronic', () => {
  let component: Electronic;
  let fixture: ComponentFixture<Electronic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Electronic]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Electronic);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
