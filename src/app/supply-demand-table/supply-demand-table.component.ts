import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { SupplyDemandTableDataSource } from './supply-demand-table-datasource';
import { Product, ProductService, Popularity, Supply, DemandShift } from '../product.service';

/**
 * Valid colum names.
 */
type ColumnName = 'name' | 'popularity' | 'supply' | 'demandShift' | 'value' | 'valueTime' | 'baseValue' | 'time';

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
  demandShiftLevels = DemandShift.levels;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: ColumnName[] = ['name', 'popularity', 'supply', 'demandShift', 'value', 'time', 'valueTime'];

  constructor(private productService: ProductService) {
    this.dataSource = new SupplyDemandTableDataSource(this.productService);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.table.dataSource = this.dataSource;
  }

  _selectNext(source: HTMLTableCellElement, focus: string): void {
    // There appears to be no really good way to discover the next row other than via DOM manipulation. Soooo...
    const nextRow = source.parentElement?.nextElementSibling;
    if (nextRow) {
      const nextElement = nextRow.querySelector('.' + focus + ' app-product-table-select button') as HTMLElement;
      if (typeof nextElement['focus'] === 'function') {
        nextElement.focus();
      }
    }
  }

  storeState(): void {
    this.productService.storeState();
  }
}
