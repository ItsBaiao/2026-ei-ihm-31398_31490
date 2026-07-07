import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular'; 
import { ProdutosService } from '../services/produtos.service';
import { ListasService, Lista } from '../services/listas.service';

@Component({
  selector: 'app-produto-detalhes',
  templateUrl: './produto-detalhes.page.html',
  styleUrls: ['./produto-detalhes.page.scss'],
  standalone: false
})
export class ProdutoDetalhesPage implements OnInit {
  
  public produtoIdId: string | null = null;
  public isListModalOpen = false;
  public produtoAtual: any = null;
  
  // Array para guardar os produtos que aparecem no carrossel de baixo
  public produtosSimilares: any[] = [];
  
  public listasNoCofre: Lista[] = [];
  public quantidadeSelecionada: number = 1;

  constructor(
    private route: ActivatedRoute,
    private produtosService: ProdutosService,
    private listasService: ListasService,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) { }

  async ngOnInit() {
    // Usamos o subscribe em vez do snapshot para que a página se atualize
    // automaticamente se o utilizador clicar num dos Produtos Similares!
    this.route.paramMap.subscribe(async params => {
      this.produtoIdId = params.get('id');

      if (this.produtoIdId) {
        this.produtosService.getTodosProdutos().subscribe(dados => {
          
          // 1. Encontrar o produto principal que o utilizador clicou
          const produtoEncontrado = dados.produtos.find(
            (p: any) => p.id.toString() === this.produtoIdId
          );
          
          if (produtoEncontrado) {
            this.produtoAtual = produtoEncontrado;

            // 2. Procurar produtos similares (mesma categoria, mas ID diferente)
            this.produtosSimilares = dados.produtos
              .filter((p: any) => p.categoria === this.produtoAtual.categoria && p.id !== this.produtoAtual.id)
              .slice(0, 3); // Limitar a 3 resultados para não encher demasiado o ecrã
          }
        });
      }
    });

    await this.listasService.init();
    this.listasNoCofre = this.listasService.minhasListas;
  }

  setModalOpen(isOpen: boolean) {
    if (isOpen) {
      this.quantidadeSelecionada = 1; // Reseta para 1 ao abrir
    }
    this.isListModalOpen = isOpen;
  }

  aumentarQuantidadeModal() {
    this.quantidadeSelecionada++;
  }

  diminuirQuantidadeModal() {
    if (this.quantidadeSelecionada > 1) {
      this.quantidadeSelecionada--;
    }
  }

  async gravarProdutoNaLista(lista: Lista) {
    await this.listasService.adicionarProdutoALista(
      lista.nome, 
      this.produtoAtual, 
      this.quantidadeSelecionada
    );
    this.setModalOpen(false);

    const toast = await this.toastCtrl.create({
      message: `${this.produtoAtual.nome} (${this.quantidadeSelecionada}x) adicionado à lista ${lista.nome}!`,
      duration: 2500,
      color: 'success',
      position: 'top',
      icon: 'checkmark-circle-outline'
    });
    await toast.present();

    this.navCtrl.navigateRoot('/tabs/tab1');
  }

  async criarListaRapida() {
    this.setModalOpen(false);

    setTimeout(async () => {
      const numeroAleatorio = Math.floor(Math.random() * 1000) + 1;
      const nomeDaNovaLista = 'Lista Rápida ' + numeroAleatorio;

      const novaLista = {
        nome: nomeDaNovaLista,
        icone: 'cart-outline',
        cor: 'border-light',
        dataEdicao: 'Criada agora mesmo',
        totalItens: this.quantidadeSelecionada,
        produtos: [{ ...this.produtoAtual, quantidade: this.quantidadeSelecionada, riscado: false, recente: true }]
      };

      await this.listasService.adicionarLista(novaLista);

      const toast = await this.toastCtrl.create({
        message: `Criada e adicionado à ${nomeDaNovaLista}!`,
        duration: 3000,
        color: 'success',
        icon: 'checkmark-circle',
        position: 'bottom',
        cssClass: 'toast-acima-das-tabs'
      });
      await toast.present();

    }, 300);
  }
}