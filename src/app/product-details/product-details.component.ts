import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../product.service';

/**
 * Displays details about the given product. This is mostly intended to be used
 * as a popup/tooltip.
 */
@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  @Input() product!: Product;
  chainedProducts!: Product[];

  constructor() { }

  ngOnInit(): void {
    this.chainedProducts = this.product.getChainsWith();
  }

  createCSSClass(product: Product): string {
    let result: string[] = [];
    if (product.popularity) {
      result.push('popularity-' + product.popularity.id);
    }
    if (product.supply) {
      result.push('supply-' + product.supply.id);
    }
    return result.join(' ');
  }
}
