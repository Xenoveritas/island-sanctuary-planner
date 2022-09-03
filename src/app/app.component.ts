import { Component, OnInit } from '@angular/core';
import { ProductService } from './product.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'island-sanctuary-planner';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.restoreState();
  }

}
