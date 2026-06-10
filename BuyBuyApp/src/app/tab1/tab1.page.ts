import { Component } from '@angular/core';
import { ListasService, Lista } from '../services/listas.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  public nomeUtilizador: string = 'Poupador';

  constructor(private listasService: ListasService) {}

  // A SOLUÇÃO DEFINITIVA: O Getter
  // O Angular vai avaliar isto em tempo real, sempre que houver qualquer mudança no sistema
  get listasNoEcra(): Lista[] {
    return this.listasService.minhasListas;
  }

  // Só precisamos de garantir que o cofre é lido na inicialização
  async ionViewWillEnter() {
    await this.listasService.init(); 
  }
}