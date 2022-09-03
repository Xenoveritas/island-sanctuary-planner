import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ProductTableDataSource } from '../product-table-datasource';
import { Product, ProductService, POPULARITY_LEVELS, SUPPLY_LEVELS } from '../product.service';

/**
 * Valid colum names.
 */
type ColumnName = 'name' | 'popularity' | 'supply' | 'value' | 'valueTime' | 'baseValue' | 'time';

@Component({
  selector: 'app-product-table',
  templateUrl: './supply-demand-table.component.html',
  styleUrls: ['./supply-demand-table.component.scss']
})
export class SupplyDemandTableComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Product>;
  dataSource: ProductTableDataSource;

  popularityLevels = POPULARITY_LEVELS;
  supplyLevels = SUPPLY_LEVELS;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: ColumnName[] = ['name', 'popularity', 'supply', 'value', 'time', 'valueTime'];

  constructor(private productService: ProductService) {
    this.dataSource = new ProductTableDataSource(this.productService);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.table.dataSource = this.dataSource;
  }

  storeState(): void {
    this.productService.storeState();
  }
}
