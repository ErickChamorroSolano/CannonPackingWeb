import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Packing } from './packing';

describe('Packing', () => {
  let component: Packing;
  let fixture: ComponentFixture<Packing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Packing],
    }).compileComponents();

    fixture = TestBed.createComponent(Packing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
