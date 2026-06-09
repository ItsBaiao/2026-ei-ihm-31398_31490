import { Component } from '@angular/core';
import { ListasService, Lista } from '../services/listas.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  public listasNoEcra: Lista[] = [];
  // 1. Variável nova para o ecrã
  public nomeUtilizador: string = 'Poupador';

  constructor(private listasService: ListasService) {}

  async ionViewWillEnter() {
    // 2. Lê a memória para ver o nome de quem entrou
    const userGuardado = localStorage.getItem('utilizadorAtual');
    if (userGuardado) {
      this.nomeUtilizador = userGuardado;
    }

    await this.listasService.init();
    this.listasNoEcra = this.listasService.minhasListas;
  }
}