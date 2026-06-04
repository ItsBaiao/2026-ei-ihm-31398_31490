import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LojaNavegacaoPageRoutingModule } from './loja-navegacao-routing.module';

import { LojaNavegacaoPage } from './loja-navegacao.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LojaNavegacaoPageRoutingModule
  ],
  declarations: [LojaNavegacaoPage]
})
export class LojaNavegacaoPageModule {}
