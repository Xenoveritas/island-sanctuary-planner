import { Component, OnInit } from '@angular/core';
import { Product, ProductService } from '../product.service';

@Component({
  selector: 'app-product-tree-page',
  templateUrl: './product-tree-page.component.html',
  styleUrls: ['./product-tree-page.component.scss']
})
export class ProductTreePageComponent implements OnInit {
  products!: Product[];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.products = this.productService.getProductList();
  }

}
