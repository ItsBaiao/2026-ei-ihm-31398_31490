import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaDetalhesPage } from './lista-detalhes.page';

const routes: Routes = [
  {
    path: '',
    component: ListaDetalhesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaDetalhesPageRoutingModule {}
