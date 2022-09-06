import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService, Supply, WorkshopTier, WORKSHOP_TIER_LEVELS } from '../product.service';

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
  workshopTier: FormControl<string>;
  groove: FormControl<number>;

  constructor(private productService: ProductService, private snackBar: MatSnackBar) {
    this.workshopTier = new FormControl<string>(this.productService.workshopTier.id, {nonNullable: true});
    this.groove = new FormControl<number>(this.productService.groove, {nonNullable: true});
  }

  ngOnInit(): void {
    this.workshopTier.valueChanges.subscribe((value) => {
      this.productService.workshopTier = WorkshopTier.fromId(value) ?? WORKSHOP_TIER_LEVELS[0];
      this.productService.storeState();
    });
    this.groove.valueChanges.subscribe((value) => {
      this.productService.groove = value === null ? 1 : value;
      this.productService.storeState();
    });
  }

  resetForNextSeason() {
    // Grab the current state
    const undoState = this.productService.createStorageState();
    // Then, modify stuff
    this.groove.setValue(1);
    const products = this.productService.getProductList();
    for (const product of products) {
      product.supply = Supply.sufficient;
    }
    const snackBarRef = this.snackBar.open('Groove reset to 1, Supply for all products set to Sufficient', 'Undo', { duration: 10000 });
    snackBarRef.onAction().subscribe(() => {
      // Restore the undo state
      this.productService.restoreState(undoState);
      // And tell the form we've changed
      this.groove.setValue(this.productService.groove);
    });
  }
}
