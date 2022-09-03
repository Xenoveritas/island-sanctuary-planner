import { DataSource } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge } from 'rxjs';
import { Product, ProductService } from './product.service';

/**
 * Data source for the various Product sources. This provides a DataSource that provides
 * various sorting and filtering options from the list of products within a ProductService.
 */
export class ProductTableDataSource extends DataSource<Product> {
  /**
   * The active view of the page data: that is, the filtered and sorted data.
   */
  data: Product[];
  sort: MatSort | undefined;

  constructor(private productService: ProductService) {
    super();
    this.data = productService.getProductList();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<Product[]> {
    if (this.sort) {
      // Combine everything that affects the rendered data into one update
      // stream for the data-table to consume.
      return merge(observableOf(this.data), this.sort.sortChange)
        .pipe(map(() => {
          return this.getSortedData([...this.data ]);
        }));
    } else {
      throw Error('Please set the sort on the data source before connecting.');
    }
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(): void {}

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: Product[]): Product[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort?.direction === 'asc';
      switch (this.sort?.active) {
        case 'name': return compare(a.name, b.name, isAsc);
        case 'popularity': return compare(a.popularity?.order ?? -1, b.popularity?.order ?? -1, isAsc);
        case 'supply': return compare(a.supply?.order ?? -1, b.supply?.order ?? -1, isAsc);
        case 'baseValue': return compare(a.value, b.value, isAsc);
        case 'value': return compare(a.getModifiedValue(), b.getModifiedValue(), isAsc);
        case 'time': return compare(a.time, b.time, isAsc);
        case 'valueTime': return compare(a.valueOverTime, b.valueOverTime, isAsc);
        default: return 0;
      }
    });
  }
}

/** Simple sort comparator. */
function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
