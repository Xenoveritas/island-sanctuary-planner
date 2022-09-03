import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTableSelectComponent } from './product-table-select.component';

describe('ProductTableSelectComponent', () => {
  let component: ProductTableSelectComponent;
  let fixture: ComponentFixture<ProductTableSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductTableSelectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductTableSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
