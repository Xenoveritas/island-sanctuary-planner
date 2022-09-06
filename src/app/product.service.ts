import { Injectable } from '@angular/core';
import productData from './product.data.json';

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

export class WorkshopTier implements ProductModifier {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly order: number,
    public readonly modifier: number
  ) {}

  /**
   * Gets the rank (alias for the order)
   */
  get rank() { return this.order; }

  static fromId(id: string): WorkshopTier | undefined {
    return WORKSHOPS[id];
  }
}

const WORKSHOPS: Record<string, WorkshopTier> = {
  'workshop-1': new WorkshopTier('workshop-1', 'Workshop I', 1, 1),
  'workshop-2': new WorkshopTier('workshop-2', 'Workshop II', 2, 1.1),
  'workshop-3': new WorkshopTier('workshop-3', 'Workshop III', 3, 1.2)
};

export const WORKSHOP_TIER_LEVELS: WorkshopTier[] = Array.from(Object.values(WORKSHOPS));

export type PersistedProductState = {
  p?: string, s?: string, pd?: string
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
  readonly categories: string[];
  readonly ingredients: Record<string, number>;
  /**
   * Popularity. Defaults to "average."
   */
  popularity = Popularity.average;
  /**
   * Popularity. Defaults to "sufficient."
   */
  supply = Supply.sufficient;
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
    return this.getModifiedValue(this.service.workshopTier, this.service.groove);
  }

  get valueOverTime(): number {
    return this.value / this.time;
  }

  constructor(public readonly id: string, json: {
    name: string,
    value: number,
    time: number,
    categories: string[],
    ingredients: Record<string, number|undefined>
  }, public readonly service: ProductService) {
    this.name = json.name;
    this.baseValue = json.value;
    this.time = json.time;
    this.categories = json.categories;
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
   * @param tier the workshop tier being used (or undefined to use 1)
   */
  getModifiedValue(tier?: WorkshopTier, groove?: number): number {
    const workshopModifier = tier?.modifier ?? 1;
    const grooveModifier = typeof groove === 'number' ? (1+(groove/100)) : 1;
    return Math.floor(this.popularityModifier * this.supplyModifier * Math.floor(this.baseValue * workshopModifier * grooveModifier));
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
    if (typeof s === 'string') {
      const supply = Supply.withId(s);
      if (supply !== undefined) {
        this.supply = supply;
      }
    }
  }
}

export type ProductServiceState = {
  products: Record<string, PersistedProductState>;
  ws: string;
  g: number;
}

export const MAX_GROOVE = 35;

/**
 * This service manages the list of products and their current popularity level.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  _products: Record<string, Product>;
  _productsByCategory: Record<string, Product[]>;
  _productList: Product[];
  /**
   * Workshop tier for calculating the value of products.
   */
  workshopTier = WORKSHOP_TIER_LEVELS[0];
  /**
   * Groove for calculating the value of products.
   */
  groove: number = 1;

  get workshopModifier(): number { return this.workshopTier.modifier ?? 1; }

  constructor() {
    this._products = {};
    this._productsByCategory = {};
    this._productList = [];
    // For ... reasons, use Object.entries (reasons = TypeScript JSON types being dumb)
    for (const [id, productJson] of Object.entries(productData.products)) {
      const product = new Product(id, productJson, this);
      this._products[id] = product;
      this._productList.push(product);
      for (const categoryId of product.categories) {
        (this._productsByCategory[categoryId] ??= []).push(product);
      }
    }
  }

  /**
   * Gets a copy of the product array in in-game order.
   * @returns a copy of the product array in in-game order
   */
  getProductList(): Product[] {
    // slice(0) clones the array
    return this._productList.slice(0);
  }

  getProductsInCategory(category: string): Product[] {
    if (category in this._productsByCategory) {
      return this._productsByCategory[category].slice(0);
    } else {
      return [];
    }
  }

  /**
   * Gets all products in the given categories. This will remove duplicates.
   * @param categories the categories
   * @returns
   */
  getProductsInCategories(categories: string[]): Product[] {
    if (categories.length === 1) {
      return this.getProductsInCategory(categories[0]);
    }
    if (categories.length < 1) {
      return [];
    }
    // Otherwise, we need to remove duplicates, so just create a set of IDs
    const resultIds = new Set<string>(categories.reduce<string[]>((result, category) => {
      if (category in this._productsByCategory) {
        result.push(...this._productsByCategory[category].map(p => p.id));
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
      ws: this.workshopTier.id,
      g: this.groove
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
          const ws = stateObj['ws'];
          if (typeof ws === 'string') {
            const workshop = WorkshopTier.fromId(ws);
            if (workshop) {
              this.workshopTier = workshop;
            }
          }
          const g = stateObj['g'];
          if (typeof g === 'number' && g >= 1 && g <= MAX_GROOVE) {
            this.groove = Math.floor(g);
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
}
