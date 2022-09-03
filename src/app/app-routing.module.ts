import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductTreeComponent } from './product-tree/product-tree.component';
import { SupplyDemandTableComponent } from './supply-demand-table/supply-demand-table.component';
import { WorkshopComponent } from './workshop/workshop.component';

const routes: Routes = [
  {path: 'workshop', component: WorkshopComponent},
  {path: 'supplyDemand', component: SupplyDemandTableComponent},
  {path: 'products', component: ProductTreeComponent},
  {path: '', redirectTo: 'supplyDemand', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
