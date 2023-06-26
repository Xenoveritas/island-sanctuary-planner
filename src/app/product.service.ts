import { Injectable } from '@angular/core';
import { IslandService, MAX_GROOVE } from './island.service';
import productData from './product.data.json';

interface CatalogEntry {
  categories: string[];
  value: number;
  time: number;
  popularity: number;
  supply: number;
}

export interface OptimizerResult {
  products: Product[];
  value: number;
  time: number;
  groove: number;
}

interface OptimizedMessageResult {
  products: string[];
  value: number;
  time: number;
  groove: number;
}

/**
 * This is simply a generic type for everything that can modify a product.
 */
export type ProductModifier = {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  readonly modifier: number;
}

/**
 * In order to make sorting and everything somewhat sane, this is the object version of the popularity level.
 */
export class Popularity implements ProductModifier {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly order: number,
    public readonly modifier: number
  ) {}

  static low = new Popularity('low', 'Low', 0, 0.8);
  static average = new Popularity('average', 'Average', 1, 1);
  static high = new Popularity('high', 'High', 2, 1.2);
  static veryHigh = new Popularity('veryHigh', 'Very High', 3, 1.4);

  static levels = [ Popularity.low, Popularity.average, Popularity.high, Popularity.veryHigh ];
  static _byId = new Map<string, Popularity>(Popularity.levels.map(level => [level.id, level]));

  static withId(id: string): Popularity;
  static withId(id: string, defaultPopularity: Popularity): Popularity;
  static withId(id: string, defaultPopularity: undefined): Popularity | undefined;
  static withId(id: string, defaultPopularity?: Popularity): Popularity | undefined {
    const result = Popularity._byId.get(id);
    return result === undefined ? defaultPopularity : result;
  }
}

/**
 * In order to make sorting and everything somewhat sane, this is the object version of the supply level.
 */
export class Supply implements ProductModifier {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly order: number,
    public readonly modifier: number
  ) {}

  static nonexistent = new Supply('nonexistent', 'Nonexistent', 0, 1.6);
  static insufficient = new Supply('insufficient', 'Insufficient', 1, 1.3);
  static sufficient = new Supply('sufficient', 'Sufficient', 2, 1);
  static surplus = new Supply('surplus', 'Surplus', 3, 0.8);
  static overflowing = new Supply('overflowing', 'Overflowing', 4, 0.6);

  static levels = [ Supply.nonexistent, Supply.insufficient, Supply.sufficient, Supply.surplus, Supply.overflowing ];
  static _byId = new Map<string, Supply>(Supply.levels.map(level => [level.id, level]));

  static withId(id: string): Supply;
  static withId(id: string, defaultSupply: Supply): Supply;
  static withId(id: string, defaultSupply: undefined): Supply | undefined;
  static withId(id: string, defaultSupply?: Supply): Supply | undefined {
    const result = Supply._byId.get(id);
    return result === undefined ? defaultSupply : result;
  }
}

export class DemandShift {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly order: number,
    public readonly value: number
  ) {}

  static plummeting = new DemandShift('plummeting', 'Plummeting', 0, -2);
  static decreasing = new DemandShift('decreasing', 'Decreasing', 1, -1);
  static none = new DemandShift('none', 'None', 2, 0);
  static increasing = new DemandShift('increasing', 'Increasing', 3, 1);
  static skyrocketing = new DemandShift('skyrocketing', 'Skyrocketing', 4, 2);

  static levels = [ DemandShift.plummeting, DemandShift.decreasing, DemandShift.none, DemandShift.increasing, DemandShift.skyrocketing ];
  static _byId = new Map<string, DemandShift>(DemandShift.levels.map(level => [level.id, level]));

  static withId(id: string): DemandShift;
  static withId(id: string, defaultDemandShift: DemandShift): DemandShift;
  static withId(id: string, defaultDemandShift: undefined): DemandShift | undefined;
  static withId(id: string, defaultDemandShift?: DemandShift): DemandShift | undefined {
    const result = DemandShift._byId.get(id);
    return result === undefined ? defaultDemandShift : result;
  }
}

export type PersistedProductState = {
  p?: string;
  s?: string;
  ds?: string;
  pd?: string;
}

/**
 * A single product that the island workshop can produce. These objects aren't really intended to be created outside a ProductService.
 */
export class Product {
  readonly name: string;
  /**
   * Base (unmodified) value
   */
  readonly baseValue: number;
  /**
   * Time in (real world) hours to make the object.
   */
  readonly time: number;
  readonly categories: Category[];
  readonly ingredients: Record<string, number>;
  /**
   * Island rank required to make this product. Currently defaults to 1, which is technically wrong.
   */
  readonly rank: number;
  /**
   * Popularity. Defaults to "average."
   */
  popularity = Popularity.average;
  /**
   * Supply. Defaults to "sufficient."
   */
  supply = Supply.sufficient;
  /**
   * Demand shift. Defaults to "none."
   */
  demandShift = DemandShift.none;
  /**
   * Predicted demand. Defaults to "average."
   */
  predictedDemand = Popularity.average;

  /**
   * Gets the popularity modifier, if a popularity has been set. Otherwise, returns 1.
   */
  get popularityModifier() {
    return this.popularity.modifier;
  }

  /**
   * Gets the supply modifier, if a supply has been set. Otherwise, returns 1.
   */
  get supplyModifier() {
    return this.supply.modifier;
  }

  /**
   * Gets the popularity modifier for the predicted demand, if a predicted demand has been set. Otherwise, returns 1.
   */
  get predictedDemandModifier() {
    return this.predictedDemand.modifier;
  }

  get value(): number {
    return this.getModifiedValue(this.service.workshopModifier, this.service.groove);
  }

  get valueOverTime(): number {
    return this.value / this.time;
  }

  constructor(public readonly id: string, json: {
    name: string,
    value: number,
    time: number,
    rank?: number,
    "rank?"?: number,
    categories: string[],
    ingredients: Record<string, number|undefined>
  }, public readonly service: ProductService) {
    this.name = json.name;
    this.baseValue = json.value;
    this.time = json.time;
    // For now, there's also a "rank?" field that indicates probable but unknown ranks
    this.rank = json.rank ?? json["rank?"] ?? 1;
    this.categories = json.categories.map((categoryId) => {
      const category = this.service.getCategory(categoryId);
      if (typeof category === 'undefined') {
        throw new Error(`Unknown category ${categoryId} in source data`);
      }
      // Also add ourself to the category
      category._products.push(this);
      return category;
    });
    // The type from TypeScript's JSON is essentially wrong because it
    // considers all the "missing" elements to be of type undefined.
    // So just copy over whatever is correct.
    const ingredients: Record<string, number> = {};
    for (const id in json.ingredients) {
      const count = json.ingredients[id];
      if (typeof count === 'number') {
        ingredients[id] = count;
      }
    }
    this.ingredients = ingredients;
  }

  /**
   * Returns the value, as modified by any settings given.
   * @param workshopModifier the modifier from the workshop, or 1
   * @param groove the current island groove, or 1
   */
  getModifiedValue(workshopModifier?: number, groove?: number): number {
    const grooveModifier = typeof groove === 'number' ? (1+(groove/100)) : 1;
    return Math.floor(this.popularityModifier * this.supplyModifier * Math.floor(this.baseValue * (workshopModifier ?? 1) * grooveModifier));
  }

  /**
   * Gets an array of all items that can chained with this product.
   */
  getChainsWith(): Product[] {
    // Grab the list of all products within a category
    const result = this.service.getProductsInCategories(this.categories);
    // And then remove ourselves
    const idx = result.findIndex(p => p.id === this.id);
    if (idx >= 0) {
      // Remove the element
      result.splice(idx, 1);
    }
    // Return the final list
    return result;
  }

  getPersistedState(): PersistedProductState | null {
    if (this.popularity || this.supply || this.predictedDemand) {
      const state: PersistedProductState = {
        p: this.popularity.id,
        s: this.supply.id,
        ds: this.demandShift.id,
        pd: this.predictedDemand.id
      };
      return state;
    } else {
      // Everything at defaults, return null
      return null;
    }
  }

  /**
   * Attempts to restore the state, if it can. Note that this will otherwise blank everything.
   * @param state the state to restore
   */
  restorePersistedState(state: Record<string, unknown>): void {
    const p = state['p'];
    this.popularity = typeof p === 'string' ? Popularity.withId(p, Popularity.average) : Popularity.average;
    const s = state['s'];
    this.supply = typeof s === 'string' ? Supply.withId(s, Supply.sufficient) : Supply.sufficient;
    const ds = state['ds'];
    this.demandShift = typeof ds === 'string' ? DemandShift.withId(ds, DemandShift.none) : DemandShift.none;
  }

  toCatalogEntry(): CatalogEntry {
    return {
      categories: this.categories.map(e => e.id),
      value: this.baseValue,
      time: this.time,
      popularity: this.popularity.order,
      supply: this.supply.order
    };
  }
}

export class Category {
  _products: Product[] = [];
  constructor(public readonly id: string, public readonly name: string) {}
}

export type ProductServiceState = {
  products: Record<string, PersistedProductState>;
  ws: string;
  g: number;
}

/**
 * This service manages the list of products and their current popularity and supply level.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  _products: Record<string, Product>;
  _productsByCategory: Record<string, Product[]>;
  _productList: Product[];
  _categories: Map<string, Category>;
  _optimizerWorker?: Worker;
  _pendingResolves: ((value: OptimizerResult[]) => void)[] = [];
  /**
   * Groove for calculating the value of products.
   */
  groove: number = 0;

  /**
   * Gets the current workshop modifier. This is currently whatever the lowest
   * workshop modifier return by the island service, or 1 if no workshops have
   * been built.
   */
  get workshopModifier(): number {
    return this.islandService.workshopModifiers.reduce(
      (lowestModifier, currentModifier) => Math.min(lowestModifier, currentModifier),
      1
    );
  }

  constructor(public readonly islandService: IslandService) {
    this._products = {};
    this._productsByCategory = {};
    this._productList = [];
    this._categories = new Map<string, Category>();
    // For ... reasons, use Object.entries (reasons = TypeScript JSON types being dumb)
    // Create categories
    for (const [id, categoryName] of Object.entries(productData.categories)) {
      this._categories.set(id, new Category(id, categoryName));
    }
    for (const [id, productJson] of Object.entries(productData.products)) {
      const product = new Product(id, productJson, this);
      this._products[id] = product;
      this._productList.push(product);
      for (const category of product.categories) {
        (this._productsByCategory[category.id] ??= []).push(product);
      }
    }

    if (typeof Worker !== 'undefined') {
      // Create a new
      this._optimizerWorker = new Worker(new URL('./product.worker', import.meta.url));
      this._optimizerWorker.onmessage = ({ data }) => {
        if (typeof data === 'object' && data != null && data.type === 'optimized') {
          // Slice off the top of the resolve FIFO
          const resolve = this._pendingResolves.shift();
          if (resolve) {
            resolve((data.results as OptimizedMessageResult[]).map(result => {
              return {
                products: result.products.map(e => this._products[e]),
                value: result.value,
                time: result.time,
                groove: result.groove
              };
            }));
          } else {
            console.error('Got response with no pending resolves left!');
          }
        }
      };
    } else {
      // Web Workers are not supported in this environment. The fallback would be doing
      // optimization calculations within the main thread, which is - not optimal. So
      // just don't support it for now.
    }
  }

  optimize(): Promise<OptimizerResult[]> {
    return new Promise<OptimizerResult[]>((resolve) => {
      // The catalog and optimize request are sent as separate messages in the theory that
      // (most) of the catalog data only needs to be sent once. However it currently also
      // contains the popularity/supply data...
      this._optimizerWorker?.postMessage({
        type: 'catalog',
        catalog: this.createCatalog()
      });
      // Because we're just sending messages, we can immediately send the message to request
      // an optimize pass.
      this._optimizerWorker?.postMessage({
        type: 'optimize',
        groove: this.groove,
        maxGroove: this.islandService.maxGroove,
        workshops: this.islandService.workshopModifiers
      });
      this._pendingResolves.push(resolve);
    });
  }

  /**
   * Gets a filtered version of the product array based on the current island rank.
   * @returns currently available products
   */
  getProductList(): Product[] {
    const rank = this.islandService.islandRank;
    return this._productList.filter((product) => product.rank <= rank);
  }

  getCategory(id: string): Category | undefined {
    return this._categories.get(id);
  }

  /**
   * Gets the products within the given category, filtered by rank.
   * @param category the category or category ID
   * @returns
   */
  getProductsInCategory(category: string | Category): Product[] {
    if (typeof category === 'object') {
      category = category.id;
    }
    if (category in this._productsByCategory) {
      const rank = this.islandService.islandRank;
      return this._productsByCategory[category].filter((product) => product.rank <= rank);
    } else {
      return [];
    }
  }

  /**
   * Gets all products in the given categories. This will remove duplicates.
   * @param categories the categories
   * @returns
   */
  getProductsInCategories(categories: (string | Category)[]): Product[] {
    if (categories.length === 1) {
      return this.getProductsInCategory(categories[0]);
    }
    if (categories.length < 1) {
      return [];
    }
    // Otherwise, we need to remove duplicates, so just create a set of IDs
    const rank = this.islandService.islandRank;
    const resultIds = new Set<string>(categories.reduce<string[]>((result, category) => {
      if (typeof category === 'object') {
        category = category.id;
      }
      if (category in this._productsByCategory) {
        // Add products currently available and then map to the ID
        result.push(...this._productsByCategory[category].filter(p => p.rank <= rank).map(p => p.id));
      }
      return result;
    }, []));
    return Array.from(resultIds).map(id => this._products[id]);
  }

  /**
   * Generates an opaque string (OK, it's a JSON string) designed to be used with storeState() and restoreState().
   */
  createStorageState(): string {
    const products: Record<string, PersistedProductState> = {};
    for (const product of this._productList) {
      // See if there's any info to store
      const state = product.getPersistedState();
      if (state !== null) {
        products[product.id] = state;
      }
    }
    return JSON.stringify({
      products: products,
      g: this.groove,
      i: this.islandService.createStorageState()
    });
  }

  /**
   * Stores state into localStorage.
   */
  storeState() {
    localStorage.setItem('island-workshop', this.createStorageState());
  }

  /**
   * Restores state from localStorage.
   */
  restoreState(existingState?: string | null) {
    if (arguments.length < 1) {
      existingState = localStorage.getItem('island-workshop');
    }
    if (existingState !== null && existingState !== undefined) {
      // Attempt to restore
      try {
        const state: unknown = JSON.parse(existingState);
        if (typeof state === 'object' && state !== null) {
          const stateObj = state as Record<string, unknown>;
          const productStates = stateObj['products'];
          if (typeof productStates === 'object' && productStates !== null) {
            // We do need it to be an object
            for (const id in productStates) {
              // Check if the state can be restored
              const product = this._products[id];
              if (product) {
                const productState = (productStates as Record<string, unknown>)[id];
                if (typeof productState === 'object' && productState !== null) {
                  product.restorePersistedState(productState as Record<string, unknown>);
                }
              } else {
                console.log(`warning: unknown product "${id}"`);
              }
            }
          }
          const g = stateObj['g'];
          if (typeof g === 'number' && g >= 1 && g <= MAX_GROOVE) {
            this.groove = Math.floor(g);
          }
          const i = stateObj['i'];
          if (typeof i !== 'undefined') {
            this.islandService.loadStorageState(i);
          }
        }
      } catch (ex) {
        console.error('Unable to restore state:', ex);
      }
    }
  }

  /**
   * Resets the state of everything to Average, Sufficient
   */
  resetState() {
    for (const product of this._productList) {
      product.popularity = Popularity.average;
      product.supply = Supply.sufficient;
      product.predictedDemand = Popularity.average;
    }
  }

  createCatalog(): Record<string, CatalogEntry> {
    const result: Record<string, CatalogEntry> = {};
    const rank = this.islandService.islandRank;
    for (const product of this._productList) {
      if (product.rank <= rank) {
        result[product.id] = product.toCatalogEntry();
      }
    }
    return result;
  }
}
