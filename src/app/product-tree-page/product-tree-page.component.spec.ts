import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTreePageComponent } from './product-tree-page.component';

describe('ProductTreePageComponent', () => {
  let component: ProductTreePageComponent;
  let fixture: ComponentFixture<ProductTreePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductTreePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductTreePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
