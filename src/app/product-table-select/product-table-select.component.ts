import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayPositionBuilder, OverlayRef, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

export type ProductTableSelectOption = {
  name: string;
  id: string;
  order: number;
};

export type MoveToNextEvent = 'row' | 'column';

/**
 * This is essentially an entirely custom <mat-select> due to the slightly
 * different styling and UI needs.
 */
@Component({
  selector: 'app-product-table-select',
  templateUrl: './product-table-select.component.html',
  styleUrls: ['./product-table-select.component.scss']
})
export class ProductTableSelectComponent implements AfterViewInit, OnInit {
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
  @Output() moveToNext = new EventEmitter<MoveToNextEvent>();
  /**
   * If set, the prefix to place before icons. Each <mat-option> will have a
   * <mat-icon> with svgIcon set to it.
   */
  @Input() iconPrefix?: string;
  // Eventually this may become configurable, but for now
  private optionHeight = 36;
  @ViewChild('optionButtons') private optionButtons!: TemplateRef<unknown>;
  private _menuPortal!: TemplatePortal;
  private menuOverlay?: OverlayRef;

  constructor(
    private overlay: Overlay,
    private overlayPositionBuilder: OverlayPositionBuilder,
    private scrollStrategyOptions: ScrollStrategyOptions,
    private _viewContainerRef: ViewContainerRef,
    private element: ElementRef
  ) { }

  ngOnInit(): void {
    this._valueIndex = this.value === null ? -1 : this._options.indexOf(this.value);
  }

  ngAfterViewInit(): void {
    this._menuPortal = new TemplatePortal(this.optionButtons, this._viewContainerRef);
  }

  toggleMenu(): void {
    if (this.menuOverlay) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu(): void {
    // Don't double-open the menu
    if (this.menuOverlay) {
      return;
    }
    console.log(this.element.nativeElement);
    console.log(`width = ${this.element.nativeElement.width}`);
    this.menuOverlay = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'product-select-backdrop',
      positionStrategy: this.overlayPositionBuilder.flexibleConnectedTo(this.element).withPositions([
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
          // Since 0 is 0, and 0 is the default, default to 0
          offsetY: this._valueIndex > 0 ? -(this.optionHeight * this._valueIndex) : 0
        }
      ]),
      panelClass: ['product-select-panel', 'mat-primary'],
      scrollStrategy: this.scrollStrategyOptions.reposition({
        autoClose: false
      }),
      width: this.element.nativeElement.offsetWidth
    });
    this.menuOverlay.attach(this._menuPortal);
    // Bind to the overlay to deal with mouse clicks
    this.menuOverlay.backdropClick().subscribe(() => {
      this.closeMenu();
    });
  }

  closeMenu(): void {
    if (this.menuOverlay) {
      // TODO: Animate the menu going away
      this.menuOverlay.dispose();
      this.menuOverlay = undefined;
    }
  }

  _handleKey(event: KeyboardEvent): void {
    if (this._handleQuickKey(event)) {
      event.preventDefault();
      // Close the menu if it were open
      this.closeMenu();
      this.moveToNext.emit('row');
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
      // Close the menu if it was open
      this.closeMenu();
      this.moveToNext.emit('row');
    }
  }

  _handleClick(_event: MouseEvent): void {
    // Basically, just do a click handler
    this.toggleMenu();
  }

  _handleOptionKey(event: KeyboardEvent): void {
    // First, see if this was a "quick key" that bypasses the menu entirely
    if (this._handleQuickKey(event)) {
      event.preventDefault();
      this.closeMenu();
      this.moveToNext.emit('row');
    }
  }

  /**
   * Internal method to determine what action to take. If true is returned, the
   * key was handled and default behavior should be ignored. If false, default
   * behavior should occur.
   * @param event the keyboard event
   * @returns
   */
  _handleQuickKey(event: KeyboardEvent): boolean {
    const key = event.key;
    if (key.length === 1) {
      // This indicates a single keycode, select the next option with that key if any
      const code = key.charCodeAt(0);
      if (code >= 48 && code < 58) {
        // Numeric key (48 = '0', 57 = '9')
        const idx = code === 48 ? 9 : code - 49;
        if (idx >= 0 && idx < this._options.length) {
          this._setValue(this._options[idx]);
        }
        return true;
      }
      const newValue = this._nextOptionWithPrefix(key);
      if (newValue !== null) {
        this._setValue(newValue);
        return true;
      }
    }
    return false;
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

  /**
   * Indicates an option was picked in some fashion through the UI. If the menu
   * is open, this will close it.
   * @param option the option that was picked
   */
  _pickValue(option: ProductTableSelectOption): void {
    this._setValue(option);
    this.closeMenu();
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
