import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';

import { ProductNode, ProductTreeDataSource } from './product-tree-datasource';
import { Product } from '../product.service';

export type ColumnName = 'name' | 'value' | 'time' | 'valueTime';

@Component({
  selector: 'app-product-tree',
  templateUrl: './product-tree.component.html',
  styleUrls: ['./product-tree.component.scss']
})
export class ProductTreeComponent implements OnInit, AfterViewInit {
  @Input() products!: Product[];
  @Input() path?: Product[];
  reversePath?: Product[];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ProductNode>;
  dataSource!: ProductTreeDataSource;
  pathTotalValue = 0;
  pathTotalTime = 0;
  reversePathTotalValue = 0;

  displayedColumns: ColumnName[] = [ 'name', 'value', 'time', 'valueTime' ];

  constructor() { }

  ngOnInit(): void {
    this.dataSource = new ProductTreeDataSource(this.products);
    if (this.path) {
      this.pathTotalValue = this.path.reduce<number>((value, current, index) =>
        value + (index == 0 ? (current.value) : (current.value * 2)), 0);
      this.pathTotalTime = this.path.reduce<number>((value, current) => value + current.time, 0);
      this.reversePath = this.path.slice().reverse();
      this.reversePathTotalValue = this.reversePath.reduce<number>((value, current, index) =>
        value + (index == 0 ? (current.value) : (current.value * 2)), 0);
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.table.dataSource = this.dataSource;
  }

  _createPath(newChild: ProductNode): Product[] {
    if (this.path) {
      return this.path.concat([newChild.product]);
    } else {
      return [newChild.product];
    }
  }
}
