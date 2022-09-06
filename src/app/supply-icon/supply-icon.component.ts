import { Component, Input, OnInit } from '@angular/core';
import { Supply } from '../product.service';

@Component({
  selector: 'app-supply-icon',
  templateUrl: './supply-icon.component.html',
  styleUrls: ['./supply-icon.component.scss']
})
export class SupplyIconComponent implements OnInit {
  @Input() supply?: Supply;
  constructor() { }

  ngOnInit(): void {
  }

  createIcon(): string {
    if (this.supply) {
      let r = '';
      for (let i = 0; i < this.supply.order; i++) {
        r += '\uD83D\uDCE6';
      }
      return r;
    } else {
      return '\u2753';
    }
  }
}
