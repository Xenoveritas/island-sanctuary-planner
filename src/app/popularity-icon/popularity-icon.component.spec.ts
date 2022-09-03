import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularityIconComponent } from './popularity-icon.component';

describe('PopularityIconComponent', () => {
  let component: PopularityIconComponent;
  let fixture: ComponentFixture<PopularityIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopularityIconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopularityIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
