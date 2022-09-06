import { DataSource } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge } from 'rxjs';
import { Product, ProductService } from '../product.service';

/**
 * A node that references a Product.
 */
export class ProductNode {
  /**
   * Whether this node is expanded.
   */
  expanded = false;
  /**
   * Lazily created child nodes.
   */
  _children?: ProductNode[];

  constructor(public readonly product: Product, public readonly depth = 0) {}

  /**
   * Gets the child nodes. Note that this tree can be expanded infinitely.
   */
  get children(): ProductNode[] {
    if (this._children === undefined) {
      // Create the child nodes
      const childDepth = this.depth + 1;
      this._children = this.product.getChainsWith().map(child => new ProductNode(child, childDepth));
    }
    return this._children;
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }
}

/**
 * Data source for the product tree.
 */
export class ProductTreeDataSource extends DataSource<ProductNode> {
  /**
   * The underlying data.
   */
  data: ProductNode[];
  sort: MatSort | undefined;

  constructor(data: Product[] | ProductNode[] | ProductService) {
    super();
    const products = Array.isArray(data) ? data : data.getProductList();
    this.data = products.map((product) => {
      if (product instanceof ProductNode) {
        return product;
      } else {
        return new ProductNode(product);
      }
    });
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<ProductNode[]> {
    if (this.sort) {
      // Combine everything that affects the rendered data into one update
      // stream for the data-table to consume.
      return merge(observableOf(this.data), this.sort.sortChange)
        .pipe(map(() => {
          return this.getSortedData([...this.data]);
        }));
    } else {
      throw Error('Please set the sort on the data source before connecting.');
    }
  }

  /**
   * Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(): void {}

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: ProductNode[]): ProductNode[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort?.direction === 'asc';
      switch (this.sort?.active) {
        case 'name': return compare(a.product.name, b.product.name, isAsc);
        case 'value': return compare(a.product.value, b.product.value, isAsc);
        case 'valueTime': return compare(a.product.valueOverTime, b.product.valueOverTime, isAsc);
        case 'time': return compare(a.product.time, b.product.time, isAsc);
        default: return 0;
      }
    });
  }
}

/** Simple sort comparator. */
function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
