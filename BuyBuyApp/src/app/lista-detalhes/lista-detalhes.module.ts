import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaDetalhesPageRoutingModule } from './lista-detalhes-routing.module';

import { ListaDetalhesPage } from './lista-detalhes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaDetalhesPageRoutingModule
  ],
  declarations: [ListaDetalhesPage]
})
export class ListaDetalhesPageModule {}
