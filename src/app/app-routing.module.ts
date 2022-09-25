import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OptimizeComponent } from './optimize/optimize.component';
import { ProductTreePageComponent } from './product-tree-page/product-tree-page.component';
import { SupplyDemandPageComponent } from './supply-demand-page/supply-demand-page.component';
import { WorkshopComponent } from './workshop/workshop.component';

const routes: Routes = [
  {path: 'workshop', component: WorkshopComponent},
  {path: 'supplyDemand', component: SupplyDemandPageComponent},
  {path: 'products', component: ProductTreePageComponent},
  {path: 'optimize', component: OptimizeComponent},
  {path: '', redirectTo: 'workshop', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
