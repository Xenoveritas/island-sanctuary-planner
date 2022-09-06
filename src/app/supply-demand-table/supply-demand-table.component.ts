import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { SupplyDemandTableDataSource } from './supply-demand-table-datasource';
import { Product, ProductService, Popularity, Supply } from '../product.service';

/**
 * Valid colum names.
 */
type ColumnName = 'name' | 'popularity' | 'supply' | 'value' | 'valueTime' | 'baseValue' | 'time';

@Component({
  selector: 'app-supply-demand-table',
  templateUrl: './supply-demand-table.component.html',
  styleUrls: ['./supply-demand-table.component.scss']
})
export class SupplyDemandTableComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Product>;
  dataSource: SupplyDemandTableDataSource;

  popularityLevels = Popularity.levels;
  supplyLevels = Supply.levels;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: ColumnName[] = ['name', 'popularity', 'supply', 'value', 'time', 'valueTime'];

  constructor(private productService: ProductService) {
    this.dataSource = new SupplyDemandTableDataSource(this.productService);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.table.dataSource = this.dataSource;
  }

  storeState(): void {
    this.productService.storeState();
  }
}
