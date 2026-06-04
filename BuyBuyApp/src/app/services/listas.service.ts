import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular'; // <-- Importamos o Storage

export interface Lista {
  nome: string;
  icone: string;
  cor: string;
  dataEdicao: string;
  totalItens: number;
}

@Injectable({
  providedIn: 'root'
})
export class ListasService {
  private _storage: Storage | null = null;
  
  // Começamos com a matriz vazia, ela vai ser preenchida pela base de dados
  public minhasListas: Lista[] = [];

  constructor(private storage: Storage) {
    this.init(); // Inicia a base de dados mal o serviço arranca
  }

  async init() {
    // Cria efetivamente o cofre no Android
    const storage = await this.storage.create();
    this._storage = storage;
    
    // Vai ao cofre procurar se já existem 'listas' guardadas de sessões anteriores
    const listasGuardadas = await this._storage.get('listas');
    
    if (listasGuardadas) {
      // Se encontrou, carrega-as para o ecrã
      this.minhasListas = listasGuardadas;
    } else {
      // Se for a primeira vez que abres a app, coloca estes dados de teste
      this.minhasListas = [
        {
          nome: 'Lista Semanal',
          icone: 'basket-outline',
          cor: 'border-dark',
          dataEdicao: 'Última edição: Ontem',
          totalItens: 12
        },
        {
          nome: 'Festa de Aniversário',
          icone: 'gift-outline',
          cor: 'border-light',
          dataEdicao: 'Criada há 3 dias',
          totalItens: 25
        }
      ];
      // Guarda logo estes dados iniciais no cofre
      this._storage.set('listas', this.minhasListas);
    }
  }

  async adicionarLista(novaLista: Lista) {
    // Adiciona a nova lista no topo (ecrã)
    this.minhasListas.unshift(novaLista);
    // Guarda a alteração fisicamente no telemóvel
    this._storage?.set('listas', this.minhasListas);
  }
}