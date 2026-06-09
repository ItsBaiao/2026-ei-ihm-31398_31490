import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EscolhaLojaPage } from './escolha-loja.page';

const routes: Routes = [
  {
    path: '',
    component: EscolhaLojaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EscolhaLojaPageRoutingModule {}
