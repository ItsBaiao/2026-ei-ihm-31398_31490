import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular'; 
import { ProdutosService } from '../services/produtos.service';
import { ListasService, Lista } from '../services/listas.service'; // Chamamos o cofre

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
  
  // Variável para mostrar as listas reais no Modal
  public listasNoCofre: Lista[] = [];

  constructor(
    private route: ActivatedRoute,
    private produtosService: ProdutosService,
    private listasService: ListasService, // Injetado aqui
    private navCtrl: NavController,       // Para voltar atrás
    private toastCtrl: ToastController    // Para a mensagem de sucesso
  ) { }

  async ngOnInit() {
    this.produtoIdId = this.route.snapshot.paramMap.get('id');

    if (this.produtoIdId) {
      this.produtosService.getTodosProdutos().subscribe(dados => {
        const produtoEncontrado = dados.produtos.find(
          (p: any) => p.id.toString() === this.produtoIdId
        );
        if (produtoEncontrado) {
          this.produtoAtual = produtoEncontrado;
        }
      });
    }

    // Carregamos as tuas listas verdadeiras para o Modal
    await this.listasService.init();
    this.listasNoCofre = this.listasService.minhasListas;
  }

  setModalOpen(isOpen: boolean) {
    this.isListModalOpen = isOpen;
  }

  // A função ativada quando clicas numa lista no Modal
  async gravarProdutoNaLista(lista: Lista) {
    // Pede ao cofre para guardar
    await this.listasService.adicionarProdutoALista(lista.nome, this.produtoAtual);

    this.setModalOpen(false);

    // Mostra um aviso verde de sucesso (Feedback visual importantíssimo em IHM!)
    const toast = await this.toastCtrl.create({
      message: `${this.produtoAtual.nome} adicionado à lista ${lista.nome}!`,
      duration: 2500,
      color: 'success',
      position: 'top',
      icon: 'checkmark-circle-outline'
    });
    await toast.present();

    // Volta automaticamente para o ecrã das listas (Tab 1)
    this.navCtrl.navigateRoot('/tabs/tab1');
  }
}