import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export type ProductTableSelectOption = {
  name: string;
  id: string;
  order: number;
};

/**
 * This is essentially an entirely custom <mat-select> due to the slightly
 * different styling and UI needs. It uses <mat-menu> for the popup.
 */
@Component({
  selector: 'app-product-table-select',
  templateUrl: './product-table-select.component.html',
  styleUrls: ['./product-table-select.component.scss']
})
export class ProductTableSelectComponent implements OnInit {
  _options!: ProductTableSelectOption[];
  @Input() label!: string;
  @Input()
  get options(): ProductTableSelectOption[] { return this._options; }
  set options(newValues: ProductTableSelectOption[]) {
    this._options = newValues;
    // Sort options by descending order
    this._options.sort((a, b) => a.order > b.order ? -1 : (a.order < b.order ? 1 : 0));
  }
  /**
   * Currently selected option index, or -1 if nothing is selected.
   */
  _valueIndex = -1;
  /**
   * Currently selected value, or null if none.
   */
  @Input() value: ProductTableSelectOption | null = null;
  @Output() valueChange = new EventEmitter<ProductTableSelectOption | null>();
  /**
   * Indicates that the value was changed in such a fashion that it would make
   * sense to move to the "next" value, if there is one.
   */
  @Output() moveToNext = new EventEmitter<void>();
  /**
   * If set, the prefix to place before icons. Each <mat-option> will have a
   * <mat-icon> with svgIcon set to it.
   */
  @Input() iconPrefix?: string;

  constructor() { }

  ngOnInit(): void {
  }

  _handleKey(event: KeyboardEvent): void {
    const key = event.key;
    if (key.length === 1) {
      // This indicates a single keycode, select the next option with that key if any
      const code = key.charCodeAt(0);
      if (code >= 48 && code < 58) {
        // Numeric key (48 = '0', 57 = '9')
        const idx = code === 48 ? 9 : code - 49;
        if (idx >= 0 && idx <= this._options.length) {
          this._setValue(this._options[idx]);
          event.preventDefault();
          this.moveToNext.emit();
        }
        return;
      }
      const newValue = this._nextOptionWithPrefix(key);
      if (newValue !== null) {
        this._setValue(newValue);
        event.preventDefault();
        this.moveToNext.emit();
      }
      return;
    }
    if (event.code === 'ArrowUp') {
      // Move to previous.
      this._valueIndex--;
      if (this._valueIndex < 0) {
        this._valueIndex = 0;
      }
      this._setValue(this._options[this._valueIndex]);
      event.preventDefault();
    } else if (event.code === 'ArrowDown') {
      // Move to next.
      this._valueIndex++;
      if (this._valueIndex >= this._options.length) {
        this._valueIndex = this._options.length - 1;
      }
      this._setValue(this._options[this._valueIndex]);
      event.preventDefault();
    } else if (event.code === 'Enter') {
      // Try and move to the next
      event.preventDefault();
      this.moveToNext.emit();
    }
  }

  _nextOptionWithPrefix(prefix: string): ProductTableSelectOption | null {
    let idx = this._valueIndex + 1;
    for (; idx < this._options.length; idx++) {
      if (prefixMatch(prefix, this._options[idx].name)) {
        return this._options[idx];
      }
    }
    // Reset to 0 and try again
    idx = 0;
    for (; idx <= this._valueIndex; idx++) {
      if (prefixMatch(prefix, this._options[idx].name)) {
        return this._options[idx];
      }
    }
    // Otherwise, return null
    return null;
  }

  _setValue(option: ProductTableSelectOption): void {
    this.value = option;
    this._valueIndex = this._options.indexOf(option);
    this.valueChange.emit(this.value);
  }
}

function prefixMatch(prefix: string, matchTo: string): boolean {
  return prefix.localeCompare(matchTo.substring(0, prefix.length), 'en', { sensitivity: 'base' }) === 0;
}
