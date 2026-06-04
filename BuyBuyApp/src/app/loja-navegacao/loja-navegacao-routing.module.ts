import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LojaNavegacaoPage } from './loja-navegacao.page';

const routes: Routes = [
  {
    path: '',
    component: LojaNavegacaoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LojaNavegacaoPageRoutingModule {}
