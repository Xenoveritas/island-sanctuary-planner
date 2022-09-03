import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ProductService, WorkshopTier, WORKSHOP_TIER_LEVELS } from '../product.service';

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

  constructor(private productService: ProductService) {
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

}
