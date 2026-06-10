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
  
  // Variáveis da pesquisa
  public searchQuery: string = '';
  public showResults: boolean = false;
  public filtroAtivo: string = 'Todos'; 
  public categoriaAtiva: string = 'Todas';
  
  public produtosDoCatalogo: any[] = []; 
  public produtosFiltrados: any[] = [];
  public pesquisasRecentes: string[] = [];

  // Variáveis do modal
  public isListModalOpen = false;
  public produtoSelecionado: any = null;
  public listasNoCofre: Lista[] = [];

  constructor(
    private produtosService: ProdutosService,
    private listasService: ListasService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    // Carrega o catálogo do JSON (Req 10 da Etapa 3)
    this.produtosService.getTodosProdutos().subscribe(dados => {
      this.produtosDoCatalogo = dados.produtos || dados; 
      this.produtosFiltrados = [...this.produtosDoCatalogo];
    });

    this.carregarPesquisasRecentes();
  }

  async ionViewWillEnter() {
    await this.listasService.init();
    this.listasNoCofre = this.listasService.minhasListas;
  }

  // --- LÓGICA DE PESQUISA E HISTÓRICO ---

  carregarPesquisasRecentes() {
    const guardadas = localStorage.getItem('pesquisasRecentes');
    if (guardadas) {
      this.pesquisasRecentes = JSON.parse(guardadas);
    }
  }

  guardarPesquisa(termo: string) {
    if (!termo || termo.trim() === '') return;
    const termoLimpo = termo.trim();

    this.pesquisasRecentes = this.pesquisasRecentes.filter(p => p.toLowerCase() !== termoLimpo.toLowerCase());
    this.pesquisasRecentes.unshift(termoLimpo);

    if (this.pesquisasRecentes.length > 3) {
      this.pesquisasRecentes.pop();
    }
    localStorage.setItem('pesquisasRecentes', JSON.stringify(this.pesquisasRecentes));
  }

  removerPesquisa(index: number, event: Event) {
    event.stopPropagation();
    this.pesquisasRecentes.splice(index, 1);
    localStorage.setItem('pesquisasRecentes', JSON.stringify(this.pesquisasRecentes));
  }

  onSearchChange(event: any) {
    this.searchQuery = event.target.value || '';
    if (this.searchQuery.length > 0) {
      this.showResults = true;
      this.aplicarFiltros();
    } else {
      this.voltarParaCategorias();
    }
  }

  buscarComEnter() {
    if (this.searchQuery.trim() !== '') {
      this.showResults = true;
      this.guardarPesquisa(this.searchQuery);
      this.aplicarFiltros();
    }
  }

  fazerPesquisa(termo: string) {
    this.searchQuery = termo;
    this.categoriaAtiva = 'Todas';
    this.filtroAtivo = 'Todos';
    this.showResults = true;
    this.guardarPesquisa(termo);
    this.aplicarFiltros();
  }

  abrirCategoria(categoria: string) {
    this.searchQuery = '';
    this.categoriaAtiva = categoria;
    this.filtroAtivo = 'Todos';
    this.showResults = true;
    this.aplicarFiltros();
  }

  mudarFiltroTopo(filtro: string) {
    this.filtroAtivo = filtro;
    this.showResults = true;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let temp = this.produtosDoCatalogo;

    if (this.categoriaAtiva !== 'Todas') {
      temp = temp.filter(p => p.categoria === this.categoriaAtiva);
    }

    if (this.filtroAtivo !== 'Todos') {
      if (this.filtroAtivo === 'Promoção') {
        temp = temp.filter(p => p.precoAntigo);
      } else {
        temp = temp.filter(p => p.tag === this.filtroAtivo);
      }
    }

    if (this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase();
      temp = temp.filter(p => p.nome.toLowerCase().includes(query) || p.categoria.toLowerCase().includes(query));
    }

    this.produtosFiltrados = temp;
  }

  voltarParaCategorias() {
    this.searchQuery = '';
    this.showResults = false;
    this.categoriaAtiva = 'Todas';
    this.filtroAtivo = 'Todos';
    this.produtosFiltrados = [...this.produtosDoCatalogo];
  }

  // --- MODAL E LISTAS ---

  abrirModalRapido(produto: any, event: Event) {
    event.stopPropagation();
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
        message: `${this.produtoSelecionado.nome} adicionado!`, duration: 2000, color: 'success', position: 'top'
      });
      await toast.present();
    }
  }

  async criarListaRapida() {
    this.setModalOpen(false);
    setTimeout(async () => {
      const nomeDaNovaLista = 'Lista Rápida ' + (Math.floor(Math.random() * 1000) + 1);
      const novaLista = {
        nome: nomeDaNovaLista, icone: 'cart-outline', cor: 'border-light', dataEdicao: 'Criada agora mesmo', totalItens: 1,
        produtos: [{ ...this.produtoSelecionado, riscado: false, recente: true }]
      };
      await this.listasService.adicionarLista(novaLista);
      this.listasNoCofre = this.listasService.minhasListas;
      const toast = await this.toastCtrl.create({
        message: `Criada e adicionado à ${nomeDaNovaLista}!`, duration: 3000, color: 'success', icon: 'checkmark-circle', position: 'bottom', cssClass: 'toast-acima-das-tabs'
      });
      await toast.present();
    }, 300);
  }
}