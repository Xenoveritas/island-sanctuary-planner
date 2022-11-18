import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DemandShift, ProductService, Supply } from '../product.service';
import { WorkshopTier, WORKSHOP_TIER_LEVELS } from '../island.service';

/**
 * Provides editing for workshop details.
 */
@Component({
  selector: 'app-workshop',
  templateUrl: './workshop.component.html',
  styleUrls: ['./workshop.component.scss']
})
export class WorkshopComponent implements OnInit {
  workshopTiers: WorkshopTier[] = WORKSHOP_TIER_LEVELS;
  islandRank: FormControl<number>;
  // Probably makes sense to do this programatically but also, whatever
  islandRanks = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
  workshop1Tier: FormControl<string>;
  workshop2Tier: FormControl<string>;
  workshop3Tier: FormControl<string>;
  groove: FormControl<number>;

  constructor(private productService: ProductService, private snackBar: MatSnackBar) {
    this.islandRank = new FormControl<number>(this.productService.islandService.islandRank, {nonNullable: true});
    this.workshop1Tier = this._workshopControl(0);
    this.workshop2Tier = this._workshopControl(1);
    this.workshop3Tier = this._workshopControl(2);
    this.groove = new FormControl<number>(this.productService.groove, {nonNullable: true});
  }

  _workshopControl(idx: number): FormControl<string> {
    let existing = this.productService.islandService.getWorkshopTier(idx);
    if (idx === 0 && existing === null) {
      existing = WORKSHOP_TIER_LEVELS[0];
    }
    const control = new FormControl<string>(existing === null ? 'none' : existing.id, {nonNullable: true});
    control.valueChanges.subscribe((value) => {
      const tier = WorkshopTier.fromId(value) ?? (idx === 0 ? WORKSHOP_TIER_LEVELS[0] : null);
      this.productService.islandService.setWorkshopTier(idx, tier);
      this.productService.storeState();
    });
    return control;
  }

  ngOnInit(): void {
    this.islandRank.valueChanges.subscribe((value) => {
      // Changes to this value determine if the workshops can be build
      this.productService.islandService.islandRank = value;
      this.updateIslandRankState();
      this.productService.storeState();
    });
    this.groove.valueChanges.subscribe((value) => {
      this.productService.groove = value === null ? 0 : value;
      this.productService.storeState();
    });
    this.updateIslandRankState();
  }

  /**
   * Recalculate things that depend on the current island rank.
   * This determines how many workshops and landmarks can currently be built.
   */
  updateIslandRankState() {
    const maxWorkshops = this.productService.islandService.maxWorkshops;
    if (maxWorkshops < 3) {
      this.workshop3Tier.disable();
    } else {
      this.workshop3Tier.enable();
    }
    if (maxWorkshops < 2) {
      this.workshop2Tier.disable();
    } else {
      this.workshop2Tier.enable();
    }
  }

  resetForNextSeason() {
    // Grab the current state
    const undoState = this.productService.createStorageState();
    // Then, modify stuff
    this.groove.setValue(0);
    const products = this.productService.getProductList();
    for (const product of products) {
      product.supply = Supply.sufficient;
      product.demandShift = DemandShift.none;
    }
    const snackBarRef = this.snackBar.open('Groove reset to 0, Supply for all products set to Sufficient, and Demand Shift to None', 'Undo', { duration: 10000 });
    snackBarRef.onAction().subscribe(() => {
      // Restore the undo state
      this.productService.restoreState(undoState);
      // And tell the form we've changed
      this.groove.setValue(this.productService.groove);
    });
  }
}
