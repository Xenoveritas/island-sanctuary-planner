import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export type ProductTableSelectOption = {
  name: string;
  id: string;
  order: number;
};

@Component({
  selector: 'app-product-table-select',
  templateUrl: './product-table-select.component.html',
  styleUrls: ['./product-table-select.component.scss']
})
export class ProductTableSelectComponent implements OnInit {
  _options!: ProductTableSelectOption[];
  _optionsById!: Record<string, ProductTableSelectOption>;
  @Input() label!: string;
  @Input()
  get options(): ProductTableSelectOption[] { return this._options; }
  set options(newValues: ProductTableSelectOption[]) {
    this._options = newValues;
    this._optionsById = {};
    for (const opt of this._options) {
      this._optionsById[opt.id] = opt;
    }
    // Sort options by descending order
    this._options.sort((a, b) => a.order > b.order ? -1 : (a.order < b.order ? 1 : 0));
  }
  @Input() value: ProductTableSelectOption | null = null;
  @Output() valueChange = new EventEmitter<ProductTableSelectOption | null>();
  /**
   * If set, the prefix to place before icons. Each <mat-option> will have a
   * <mat-icon> with svgIcon set to it.
   */
  @Input() iconPrefix?: string;

  constructor() { }

  ngOnInit(): void {
  }

  onValueChanged(newValue: string) {
    // The new value is the ID of the options, so emit the actual option - or null if none
    this.value = this._optionsById[newValue] ?? null;
    this.valueChange.emit(this.value);
  }
}
