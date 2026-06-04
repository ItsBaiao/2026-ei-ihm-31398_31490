import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NovaListaPageRoutingModule } from './nova-lista-routing.module';

import { NovaListaPage } from './nova-lista.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NovaListaPageRoutingModule
  ],
  declarations: [NovaListaPage]
})
export class NovaListaPageModule {}
