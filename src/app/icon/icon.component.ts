import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { DemandShift, Popularity, Supply } from '../product.service';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnInit, OnChanges {
  @Input()
  popularity?: Popularity;
  @Input()
  supply?: Supply;
  @Input()
  demandShift?: DemandShift;

  _iconUrl: string | null = null;
  _className: string = 'placeholder';

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this._iconUrl = this._createIconUrl();
    this._className = this._createClassName();
  }

  _createIconUrl(): string | null {
    // For now, just go in order, popularity overrides supply overrides demand
    if (this.popularity) {
      return 'island:popularity-' + this.popularity.id;
    } else if (this.supply) {
      return 'island:supply-' + this.supply.id;
    } else if (this.demandShift) {
      return 'island:demandShift-' + this.demandShift.id;
    } else {
      // Return null, in which case the icon will become a placeholder
      return null;
    }
  }

  _createClassName(): string {
    // For now, just go in order, popularity overrides supply overrides demand
    if (this.popularity) {
      return 'popularity popularity-' + this.popularity.id;
    } else if (this.supply) {
      return 'supply supply-' + this.supply.id;
    } else if (this.demandShift) {
      return 'demandShift demandShift-' + this.demandShift.id;
    } else {
      return 'placeholder';
    }
  }
}
