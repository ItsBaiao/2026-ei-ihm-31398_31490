import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export interface Lista {
  nome: string;
  icone: string;
  cor: string;
  dataEdicao: string;
  totalItens: number;
  produtos?: any[]; // O "carrinho" onde os produtos vão ficar guardados
}

@Injectable({
  providedIn: 'root'
})
export class ListasService {

  private _storage: Storage | null = null;
  public minhasListas: Lista[] = [];

  constructor(private storage: Storage) { }

  async init() {
    if (!this._storage) {
      const storage = await this.storage.create();
      this._storage = storage;
    }
    const listasGuardadas = await this._storage.get('listas');
    if (listasGuardadas) {
      this.minhasListas = listasGuardadas;
    }
  }

  async adicionarLista(lista: Lista) {
    this.minhasListas.push(lista);
    await this._storage?.set('listas', this.minhasListas);
  }

  // A MAGIA DA TAREFA M1: Adicionar um produto a uma lista específica
  async adicionarProdutoALista(nomeDaLista: string, produto: any) {
    const index = this.minhasListas.findIndex(l => l.nome === nomeDaLista);
    if (index !== -1) {
      // Se a lista ainda não tiver produtos, criamos um array vazio
      if (!this.minhasListas[index].produtos) {
        this.minhasListas[index].produtos = [];
      }
      
      // Colocamos o produto lá dentro. 
      // Já leva o "riscado: false" para a Tarefa M3 e o "recente: true" para piscar a amarelo como no teu cenário!
      this.minhasListas[index].produtos.push({ ...produto, riscado: false, recente: true });
      
      // Atualizamos os contadores
      this.minhasListas[index].totalItens = this.minhasListas[index].produtos.length;
      this.minhasListas[index].dataEdicao = 'Atualizada agora mesmo';

      // Guardamos tudo no cofre
      await this._storage?.set('listas', this.minhasListas);
    }
  }
  async guardarAlteracoes() {
    await this._storage?.set('listas', this.minhasListas);
  }
}