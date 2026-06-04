import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NovaListaPage } from './nova-lista.page';

const routes: Routes = [
  {
    path: '',
    component: NovaListaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NovaListaPageRoutingModule {}
