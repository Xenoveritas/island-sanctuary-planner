import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyDemandPageComponent } from './supply-demand-page.component';

describe('SupplyDemandPageComponent', () => {
  let component: SupplyDemandPageComponent;
  let fixture: ComponentFixture<SupplyDemandPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplyDemandPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplyDemandPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
