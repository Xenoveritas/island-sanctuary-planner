import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Overlay, OverlayPositionBuilder, OverlayRef, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Product } from '../product.service';

/**
 * Displays information about a product. Also provides support for a tooltip on hover.
 */
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements AfterViewInit, OnDestroy, OnInit {
  @Input()
  product!: Product;
  @Input()
  showIcons = false;
  @Input()
  showCategories = false;
  @Input()
  popupDelay = 500;

  _popupTimeout?: number;
  @ViewChild('popup') private _popup!: TemplateRef<unknown>;
  private _popupPortal!: TemplatePortal;
  private _popupOverlay?: OverlayRef;

  constructor(
    private _overlay: Overlay,
    private _overlayPositionBuilder: OverlayPositionBuilder,
    private _scrollStrategyOptions: ScrollStrategyOptions,
    private _viewContainerRef: ViewContainerRef,
    private _element: ElementRef
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    // Kill the popup (if it exists)
    this.closePopup();
  }

  ngAfterViewInit(): void {
    this._popupPortal = new TemplatePortal(this._popup, this._viewContainerRef);
  }

  openPopup(): void {
    // Don't double-open the menu
    if (this._popupOverlay) {
      return;
    }
    this._popupOverlay = this._overlay.create({
      hasBackdrop: false,
      backdropClass: 'product-popup-backdrop',
      positionStrategy: this._overlayPositionBuilder.flexibleConnectedTo(this._element).withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        }
      ]),
      panelClass: ['product-details-panel', 'mat-primary'],
      scrollStrategy: this._scrollStrategyOptions.reposition({
        autoClose: false
      })
    });
    this._popupOverlay.attach(this._popupPortal);
    // Bind to the overlay to deal with mouse clicks
    this._popupOverlay.backdropClick().subscribe(() => {
      this.closePopup();
    });
  }

  closePopup(): void {
    if (this._popupOverlay) {
      // TODO: Animate the popup going away
      this._popupOverlay.dispose();
      this._popupOverlay = undefined;
    }
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this._popupTimeout = window.setTimeout(() => {
      this._popupTimeout = undefined;
      this.openPopup();
    }, this.popupDelay);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (typeof this._popupTimeout !== 'undefined') {
      window.clearTimeout(this._popupTimeout);
      this._popupTimeout = undefined;
    }
    // Close the popup if it was opened
    this.closePopup();
  }
}
