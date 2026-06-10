import { Component } from '@angular/core';
import { ListasService, Lista } from '../services/listas.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  public primeiroNome: string = 'Poupador';
  public iniciaisAvatar: string = 'PO';

  constructor(private listasService: ListasService) {}

  // O nosso Getter para as listas 
  get listasNoEcra(): Lista[] {
    return this.listasService.minhasListas;
  }

  async ionViewWillEnter() {
    await this.listasService.init(); 

    // Agora sim! Vai buscar à chave EXATA que definiste no teu login/perfil
    const userGuardado = localStorage.getItem('utilizadorAtual');
    
    if (userGuardado) {
      // Extrai apenas o primeiro nome (ex: "Joao Gaiao" -> "Joao")
      this.primeiroNome = userGuardado.trim().split(' ')[0];
      
      // Gera as iniciais usando a mesma função da Tab3
      this.gerarIniciais(userGuardado);
    }
  }

  // A mesma função genial que tens na Tab3, adaptada para a variável desta página
  gerarIniciais(nome: string) {
    const nomes = nome.trim().split(' ');
    if (nomes.length > 1) {
      this.iniciaisAvatar = nomes[0][0].toUpperCase() + nomes[nomes.length - 1][0].toUpperCase();
    } else {
      this.iniciaisAvatar = nome.substring(0, 2).toUpperCase();
    }
  }
}