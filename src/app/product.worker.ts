/// <reference lib="webworker" />

interface Message {
  type: string;
}

function isMessage(o: unknown): o is Message {
  return typeof o === 'object' && o !== null && typeof (o as Message).type === 'string';
}

interface CatalogEntry {
  categories: string[];
  /**
   * Base value (needed to calculate modified base value based on groove and workshop tier)
   */
  value: number;
  /**
   * Current supply index
   */
  supply: number;
  /**
   * Current popularity index
   */
  popularity: number;
  time: number;
}

interface CatalogMessage extends Message {
  type: "catalog";
  catalog: Record<string, CatalogEntry>;
}

/**
 * Run an optimizer pass.
 */
interface OptimizeMessage extends Message {
  type: "optimize";
  groove: number;
  maxGroove: number;
  workshops: number[];
  maxResults?: number;
}

interface OptimizerResult {
  products: string[];
  value: number;
  /**
   * How long this result took to make
   */
  time: number;
  /**
   * The final groove amount
   */
  groove: number;
}

/**
 * Simple message indicating the optimizer is ready to run (it has the catalog).
 */
interface ReadyResponse {
  type: "ready";
}

interface OptimizeResponse {
  type: "optimized";
  results: OptimizerResult[];
}

const POPULARITY_MODIFIERS = [ 0.8, 1, 1.2, 1.4 ];
const SUPPLY_MODIFIERS = [ 1.6, 1.3, 1, 0.8, 0.6 ];

class Product {
  children: Product[] = [];
  constructor(
    public readonly id: string,
    public readonly value: number,
    public readonly time: number,
    public readonly popularity: number,
    public supply: number
  ) {}

  modifiedValue(workshop: number, groove: number): number {
    return Math.floor(
      POPULARITY_MODIFIERS[this.popularity]
      * SUPPLY_MODIFIERS[this.supply]
      * Math.floor(this.value * workshop * (1+(groove/100)))
    );
  }

  totalValue(workshops: number[], groove: number): number {
    let total = 0;
    for (let i = 0; i < workshops.length; i++) {
      total += this.modifiedValue(workshops[i], groove);
    }
    return total;
  }
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
      const product = new Product(id, entry.value, entry.time, entry.popularity, entry.supply);
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

  /**
   * Optimize based on a comparator.
   * @param workshops currently available workshops (specifically, their modifiers)
   * @param groove starting groove
   * @param maxGroove maximum groove can go to
   * @param limit the maximum number of results to return
   */
  optimize(workshops: number[], groove: number, maxGroove: number, limit = 100) {
    // Run through all possible agendas.
    let results: OptimizerResult[] = [];
    for (const product of this._products) {
      runOptimize(workshops, [], product, 0, 0, groove, maxGroove, results);
    }
    // Note that we flip the comparator - this is intentional, as we want the "best" to be
    // first, and that means that they should sort "first"
    results.sort((a, b) => {
      // If the groove is the same...
      if (a.groove === b.groove) {
        // ...order by value (more value better AKA "less than" lower)
        return a.value === b.value ? 0 : (a.value > b.value ? -1 : 1);
      } else {
        return a.groove > b.groove ? -1 : 1;
      }
    });
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
 * The item catalog. Initially set to an empty catalog.
 */
let catalog = new Catalog({});

// The optimizer worker. The optimizer simply goes through every single product
// and determines an order that produces the most value under 24 hours.

addEventListener('message', ({ data }: { data: unknown }) => {
  // Data is the message being received
  if (isMessage(data)) {
    if (data.type === 'catalog') {
      // Catalog message, which gives us the catalog to optimize
      catalog = new Catalog((data as CatalogMessage).catalog);
      // With the catalog set, return a message indicating we're ready.
      postMessage({ type: "ready" });
    } else if (data.type === 'optimize') {
      const message = data as OptimizeMessage;
      catalog.optimize(message.workshops, message.groove, message.maxGroove);
    }
  }
});

/**
 *
 * @param previous All previous objects
 * @param current current object to check
 * @param value value ***not** including current*
 * @param time time ***not** including current*
 * @param groove the amount of groove at this point in production
 * @param results
 */
function runOptimize(
  workshops: number[],
  previous: Product[],
  current: Product,
  value: number,
  time: number,
  groove: number,
  maxGroove: number,
  results: OptimizerResult[]
): void {
  const newPath = previous.concat([current]);
  // Value and time does not include current, calculate it now
  let producedValue = current.totalValue(workshops, groove);
  if (previous.length > 0) {
    // If this is a chain, it doubled the value
    producedValue *= 2;
  }
  value += producedValue;
  time += current.time;
  // Calculate new groove after this set of items complete
  groove = Math.min(groove + workshops.length, maxGroove);
  let terminal = true;
  for (const product of current.children) {
    // See if this is even possible
    if (product.time + time <= 24) {
      // Recurse into that path, making this non-terminal
      terminal = false;
      runOptimize(
        workshops,
        newPath,
        product,
        value,
        time,
        groove,
        maxGroove,
        results
      );
    }
  }
  if (terminal) {
    // Terminal, so add it to results
    results.push({
      products: newPath.map(e => e.id),
      value: value,
      time: time,
      groove: groove
    });
  }
}
