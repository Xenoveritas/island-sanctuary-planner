/// <reference lib="webworker" />

interface Message {
  type: string;
}

function isMessage(o: unknown): o is Message {
  return typeof o === 'object' && o !== null && typeof (o as Message).type === 'string';
}

interface CatalogEntry {
  categories: string[];
  value: number;
  time: number;
}

interface CatalogMessage extends Message {
  type: "catalog";
  catalog: Record<string, CatalogEntry>;
}

interface OptimizerResult {
  products: string[];
  value: number;
  time: number;
}

interface OptimizeResponse {
  type: "optimized";
  results: OptimizerResult[];
}

// The optimizer worker. The optimizer simply goes through every single product
// and determines an order that produces the most value under 24 hours.

addEventListener('message', ({ data }: { data: unknown }) => {
  // Data is the message being received
  if (isMessage(data)) {
    if (data.type === 'catalog') {
      // Catalog message, which gives us the catalog to optimize
      new Catalog((data as CatalogMessage).catalog).optimize();
    }
  }
});

class Product {
  children: Product[] = [];
  constructor(public readonly id: string, public readonly value: number, public readonly time: number) {}
}

class Catalog {
  _products: Product[];
  constructor(catalog: Record<string, CatalogEntry>) {
    // Step 1: bin into categories
    const categories = new Map<string, string[]>();
    for (const id in catalog) {
      const entry = catalog[id];
      for (const category of entry.categories) {
        const existing = categories.get(category);
        if (existing) {
          existing.push(id);
        } else {
          categories.set(category, [id]);
        }
      }
    }
    // Step 2: rehydrate products without category info
    this._products = [];
    const productMap = new Map<string, Product>();
    for (const id in catalog) {
      const entry = catalog[id];
      const product = new Product(id, entry.value, entry.time);
      this._products.push(product);
      productMap.set(id, product);
    }
    // Step 3: rehydrate categories
    for (const product of this._products) {
      const entry = catalog[product.id];
      // Create set of children
      const childSet = new Set<string>();
      for (let idx = 0; idx < entry.categories.length; idx++) {
        for (const id of entry.categories) {
          const categoryItems = categories.get(id);
          if (categoryItems) {
            categoryItems.forEach(childSet.add.bind(childSet));
          }
        }
      }
      // Remove ourselves from the set
      childSet.delete(product.id);
      const children = Array.from(childSet.values());
      product.children = children.map(e => {
        const child = productMap.get(e);
        if (child) {
          return child;
        } else {
          throw new Error(`invalid category child ${e}: missing`);
        }
      });
    }
  }

  optimize(limit = 100) {
    // Run through all possible agendas.
    let results: OptimizerResult[] = [];
    for (const product of this._products) {
      runOptimize([], product, product.value, product.time, results);
    }
    results.sort((a, b) => a.value === b.value ? 0 : (a.value < b.value ? 1 : -1));
    // Limit to top n
    if (results.length > limit) {
      results = results.slice(0, limit);
    }
    postMessage({
      type: "optimized",
      results: results
    });
  }
}

/**
 *
 * @param previous All previous objects
 * @param current current object to check
 * @param value value *including current*
 * @param time time *including current*
 */
function runOptimize(previous: Product[], current: Product, value: number, time: number, results: OptimizerResult[]): void {
  const newPath = previous.concat([current]);
  let terminal = true;
  for (const product of current.children) {
    // See if this is even possible
    if (product.time + time <= 24) {
      // Recurse into that path, making this non-terminal
      terminal = false;
      runOptimize(newPath, product, value + product.value * 2, time + product.time, results);
    }
  }
  if (terminal) {
    // Terminal, so add it to results
    results.push({
      products: newPath.map(e => e.id),
      value: value,
      time: time
    });
  }
}
