import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SupplyDemandTableComponent } from './supply-demand-table/supply-demand-table.component';
import { ProductTableSelectComponent } from './product-table-select/product-table-select.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { PopularityIconComponent } from './popularity-icon/popularity-icon.component';
import { SupplyIconComponent } from './supply-icon/supply-icon.component';
import { WorkshopComponent } from './workshop/workshop.component';
import { ProductTreeComponent } from './product-tree/product-tree.component';

@NgModule({
  declarations: [
    AppComponent,
    SupplyDemandTableComponent,
    ProductTableSelectComponent,
    ProductDetailsComponent,
    PopularityIconComponent,
    SupplyIconComponent,
    WorkshopComponent,
    ProductTreeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
