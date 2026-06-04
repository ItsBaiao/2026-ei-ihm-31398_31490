import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ProdutosService } from '../services/produtos.service';
import { ListasService, Lista } from '../services/listas.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  
  public searchQuery: string = '';
  public showResults: boolean = false;
  public produtosDoCatalogo: any[] = []; 

  // Variáveis para o Modal de adição rápida
  public isListModalOpen = false;
  public produtoSelecionado: any = null;
  public listasNoCofre: Lista[] = [];

  constructor(
    private produtosService: ProdutosService,
    private listasService: ListasService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    this.produtosService.getTodosProdutos().subscribe(dados => {
      this.produtosDoCatalogo = dados.produtos; 
    });
  }

  // Carrega as listas sempre que entras na pesquisa
  async ionViewWillEnter() {
    await this.listasService.init();
    this.listasNoCofre = this.listasService.minhasListas;
  }

  // Função mágica que bloqueia a ida para os detalhes e abre o Modal
  abrirModalRapido(produto: any, event: Event) {
    event.stopPropagation(); // Bloqueia o clique no cartão
    this.produtoSelecionado = produto;
    this.isListModalOpen = true;
  }

  setModalOpen(isOpen: boolean) {
    this.isListModalOpen = isOpen;
  }

  async gravarProdutoNaLista(lista: Lista) {
    if (this.produtoSelecionado) {
      await this.listasService.adicionarProdutoALista(lista.nome, this.produtoSelecionado);
      this.setModalOpen(false);

      const toast = await this.toastCtrl.create({
        message: `${this.produtoSelecionado.nome} adicionado!`,
        duration: 2000, color: 'success', position: 'top'
      });
      await toast.present();
    }
  }

  onSearchChange(event: any) { this.showResults = this.searchQuery.length > 0; }
  clearSearch() { this.searchQuery = ''; this.showResults = false; }
  simulateSearch() { this.searchQuery = 'Leite'; this.showResults = true; }
}