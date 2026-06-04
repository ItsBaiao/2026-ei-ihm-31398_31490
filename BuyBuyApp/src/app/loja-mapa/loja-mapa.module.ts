import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LojaMapaPageRoutingModule } from './loja-mapa-routing.module';

import { LojaMapaPage } from './loja-mapa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LojaMapaPageRoutingModule
  ],
  declarations: [LojaMapaPage]
})
export class LojaMapaPageModule {}
