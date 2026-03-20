import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Towels } from './towels';

describe('Towels', () => {
  let component: Towels;
  let fixture: ComponentFixture<Towels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Towels],
    }).compileComponents();

    fixture = TestBed.createComponent(Towels);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
