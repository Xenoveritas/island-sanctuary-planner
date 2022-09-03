import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export type ProductTableSelectOption = {
  name: string;
  id: string;
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
  }
  @Input() value: ProductTableSelectOption | null = null;
  @Output() valueChange = new EventEmitter<ProductTableSelectOption | null>();

  constructor() { }

  ngOnInit(): void {
  }

  onValueChanged(newValue: string) {
    // The new value is the ID of the options, so emit the actual option - or null if none
    this.value = this._optionsById[newValue] ?? null;
    this.valueChange.emit(this.value);
  }
}
