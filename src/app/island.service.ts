import { Injectable } from '@angular/core';
import islandData from './island.data.json';
import type { ProductModifier } from './product.service';

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

const WORKSHOPS: Record<string, WorkshopTier> = {};
// Build workshops from the JSON data
islandData.workshop.modifiers.tier.forEach((modifier, idx) => {
  const id = `workshop-${idx + 1}`;
  WORKSHOPS[id] = new WorkshopTier(id, islandData.workshop.modifiers.tierNames[idx], idx, modifier);
});

export const WORKSHOP_TIER_LEVELS: WorkshopTier[] = Array.from(Object.values(WORKSHOPS));

/**
 * The maximum number of workshops possible.
 */
// This reads strangely, but the "ranks" are the ranks workshops are unlocked at, so this is
// counting the total number unlocked.
export const MAX_WORKSHOPS = islandData.workshop.ranks.length;
/**
 * The maximum island rank.
 */
export const MAX_ISLAND_RANK = islandData.maxRank;
export const MAX_LANDMARKS = islandData.landmark.ranks.length;

function clampInt(value: unknown, min: number, max: number, defaultValue?: number): number {
  if (typeof value === 'number') {
    if (value >= min && value < max) {
      return Math.floor(value);
    }
  }
  return defaultValue ?? min;
}

/**
 * This service manages basic island data.
 */
@Injectable({
  providedIn: 'root'
})
export class IslandService {
  /**
   * Workshop tiers currently on the island (0-based, 0 = Tier 1, but may also
   * include -1 to indicate no workshop).
   */
  workshops: number[] = [];
  /**
   * Island rank, currently from 1-12. Defaults to 3, as this app is useless below
   * that island rank anyway, and everything is a tutorial until rank 4 anyway.
   */
  islandRank: number = 3;
  /**
   * Total landmarks on the island. This determines the maximum groove possible
   * on the island.
   */
  landmarkCount: number = 0;

  constructor() {
  }

  /**
   * Gets the maximum possible groove for the current island, based on the
   * landmark count.
   */
  get maxGroove(): number {
    return islandData.landmark.maxGroove[this.landmarkCount];
  }

  /**
   * Gets the total number of workshops available at the current island rank.
   * (Note that this can be 0.)
   */
  get maxWorkshops(): number {
    // This could be a binary search but also it's not that complicated
    let i;
    for (i = 0; i < islandData.workshop.ranks.length; i++) {
      if (this.islandRank < islandData.workshop.ranks[i]) {
        return i;
      }
    }
    return i;
  }

  /**
   * Gets the workshop modifiers for all workshops. This will omit any unbuilt
   * workshops.
   */
  get workshopModifiers(): number[] {
    return this.workshops.filter((idx) => idx >= 0 && idx < WORKSHOP_TIER_LEVELS.length).map(idx => WORKSHOP_TIER_LEVELS[idx].modifier);
  }

  /**
   * Gets the workshop tier at the given index.
   * @param index the index
   */
  getWorkshopTier(index: number): WorkshopTier | null {
    if (index < 0 || index >= this.workshops.length) {
      return null;
    }
    const idx = this.workshops[index];
    return idx < 0 ? null : WORKSHOP_TIER_LEVELS[idx];
  }

  /**
   *
   * @param index the workshop to set, should be from 0 inclusive to MAX_WORKSHOPS exclusive
   * @param tier the tier to set it to, either the object version or the 0-based index
   */
  setWorkshopTier(index: number, tier: WorkshopTier | null | number): void {
    if (index < 0 || index >= MAX_WORKSHOPS) {
      // Do nothing
      return;
    }
    if (this.workshops.length <= index) {
      // If the current list is too short, lengthen it
      Array.prototype.push.call(this.workshops, Array.from(Array(index - this.workshops.length + 1), _ => -1));
    }
    if (typeof tier === 'number') {
      if (tier < 0 || tier >= WORKSHOP_TIER_LEVELS.length) {
        throw new Error(`Invalid workshop tier ${tier}: out of range [0,${WORKSHOP_TIER_LEVELS.length})`);
      }
    } else {
      tier = tier === null ? -1 : tier.order;
    }
    this.workshops[index] = tier;
  }

  getWorkshopModifier(index: number): number {
    if (index < 0 || index >= this.workshops.length) {
      return 0;
    }
    return islandData.workshop.modifiers.tier[this.workshops[index]];
  }

  /**
   * Generates a JSON object that be used to persist this object.
   */
  createStorageState(): Record<string, unknown> {
    return {
      w: this.workshops.slice(),
      r: this.islandRank,
      l: this.landmarkCount
    };
  }

  /**
   * Restores state from localStorage.
   */
  loadStorageState(storageState: unknown) {
    if (typeof storageState === 'object' && storageState !== null) {
      const state = storageState as Record<string, unknown>;
      // Attempt to restore
      const w = state['w'];
      if (Array.isArray(w)) {
        // Filter out any invalid values
        this.workshops = w
          .filter<number>((v): v is number => typeof v === 'number' && v >= 0 && v < WORKSHOP_TIER_LEVELS.length)
          .map(v => Math.floor(v));
        // If all values are invalid, reset to blank
        if (this.workshops.length < 1) {
          this.workshops = [ 0 ];
        }
      }
      this.islandRank = clampInt(state['r'], 1, MAX_ISLAND_RANK + 1, this.islandRank);
      this.landmarkCount = clampInt(state['l'], 0, MAX_LANDMARKS, this.landmarkCount);
    }
  }
}
