import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MaterialModule } from '../material.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SupplyDemandTableComponent } from './supply-demand-table/supply-demand-table.component';
import { ProductTableSelectComponent } from './product-table-select/product-table-select.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { WorkshopComponent } from './workshop/workshop.component';
import { ProductTreeComponent } from './product-tree/product-tree.component';
import { ProductTreePageComponent } from './product-tree-page/product-tree-page.component';
import { SupplyDemandPageComponent } from './supply-demand-page/supply-demand-page.component';
import { OptimizeComponent } from './optimize/optimize.component';
import { IconComponent } from './icon/icon.component';
import { ProductComponent } from './product/product.component';

@NgModule({
  declarations: [
    AppComponent,
    SupplyDemandTableComponent,
    ProductTableSelectComponent,
    ProductDetailsComponent,
    WorkshopComponent,
    ProductTreeComponent,
    ProductTreePageComponent,
    SupplyDemandPageComponent,
    OptimizeComponent,
    IconComponent,
    ProductComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
