import { Component, OnInit } from '@angular/core';
import { OptimizerResult, ProductService } from '../product.service';

@Component({
  selector: 'app-optimize',
  templateUrl: './optimize.component.html',
  styleUrls: ['./optimize.component.scss']
})
export class OptimizeComponent implements OnInit {
  results?: OptimizerResult[];
  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.productService.optimize().then(results => { this.results = results; });
  }

}
