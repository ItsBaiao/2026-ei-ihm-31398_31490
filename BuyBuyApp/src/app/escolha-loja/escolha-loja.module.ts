import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EscolhaLojaPageRoutingModule } from './escolha-loja-routing.module';

import { EscolhaLojaPage } from './escolha-loja.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EscolhaLojaPageRoutingModule
  ],
  declarations: [EscolhaLojaPage]
})
export class EscolhaLojaPageModule {}
