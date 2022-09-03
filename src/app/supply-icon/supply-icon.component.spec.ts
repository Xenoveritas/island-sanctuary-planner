import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyIconComponent } from './supply-icon.component';

describe('SupplyIconComponent', () => {
  let component: SupplyIconComponent;
  let fixture: ComponentFixture<SupplyIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplyIconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplyIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
