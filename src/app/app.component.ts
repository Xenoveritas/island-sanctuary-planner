import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ProductService } from './product.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'island-sanctuary-planner';

  constructor(private productService: ProductService, private sanitizer: DomSanitizer, private iconRegistry: MatIconRegistry) {}

  ngOnInit(): void {
    this.iconRegistry.addSvgIconSetInNamespace('island', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/icons.svg'));
    this.productService.restoreState();
  }

}
