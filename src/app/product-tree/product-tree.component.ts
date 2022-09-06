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
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ProductNode>;
  dataSource!: ProductTreeDataSource;

  displayedColumns: ColumnName[] = [ 'name', 'value', 'time', 'valueTime' ];

  constructor() { }

  ngOnInit(): void {
    this.dataSource = new ProductTreeDataSource(this.products);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.table.dataSource = this.dataSource;
  }

}
