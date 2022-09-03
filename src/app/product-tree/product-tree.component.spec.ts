import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTreeComponent } from './product-tree.component';

describe('ProductTreeComponent', () => {
  let component: ProductTreeComponent;
  let fixture: ComponentFixture<ProductTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductTreeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
