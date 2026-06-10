import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController, ActionSheetController, AlertController, NavController } from '@ionic/angular';
import { ListasService, Lista } from '../services/listas.service';
import { Network } from '@capacitor/network'; 

@Component({
  selector: 'app-lista-detalhes',
  templateUrl: './lista-detalhes.page.html',
  styleUrls: ['./lista-detalhes.page.scss'],
  standalone: false
})
export class ListaDetalhesPage implements OnInit, OnDestroy {

  public listaAtual: Lista | undefined;
  public progresso: number = 0;
  public marcados: number = 0;
  
  public isOffline: boolean = false;
  public avisoOffline: HTMLIonToastElement | null = null;
  private networkListener: any; 

  constructor(
    private route: ActivatedRoute,
    private listasService: ListasService,
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) { }

  async ngOnInit() {
    this.ligarDetetores();
  }

  async ionViewWillEnter() {
    this.isOffline = !navigator.onLine;
    await this.listasService.init();
    
    const nomeRecebido = this.route.snapshot.paramMap.get('nome');
    if (nomeRecebido) {
      this.listaAtual = this.listasService.minhasListas.find(l => l.nome === nomeRecebido);
      this.calcularProgresso(); 
    }
  }

  async ionViewDidEnter() {
    const status = await Network.getStatus();
    if (!status.connected || !navigator.onLine) {
      this.mostrarAvisoOffline();
    }
  }

  async iniciarCompras() {
    if (!this.listaAtual?.produtos || this.listaAtual.produtos.length === 0) {
      const toast = await this.toastCtrl.create({
        message: 'Adiciona pelo menos um produto para iniciar as compras.',
        duration: 2500,
        color: 'warning',
        icon: 'alert-circle-outline',
        position: 'bottom', // <-- Alterado para baixo
        cssClass: 'toast-acima-do-botao' // <-- Nova classe
      });
      await toast.present();
    } else {
      this.navCtrl.navigateForward(['/loja-navegacao', this.listaAtual.nome]);
    }
  }

  ngOnDestroy() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
    window.removeEventListener('online', this.esconderAviso.bind(this));
    window.removeEventListener('offline', this.mostrarAvisoOffline.bind(this));
  }

  async editarListaCompleta() {
    if (this.listaAtual) {
      this.navCtrl.navigateForward(['/nova-lista'], {
        queryParams: { editar: this.listaAtual.nome }
      });
    }
  }

  async apagarLista() {
    if (this.listaAtual) {
      const index = this.listasService.minhasListas.findIndex(l => l.nome === this.listaAtual?.nome);
      
      if (index > -1) {
        this.listasService.minhasListas.splice(index, 1);
        await this.listasService.guardarAlteracoes();
        
        const toast = await this.toastCtrl.create({
          message: 'Lista apagada com sucesso!',
          duration: 2000, 
          color: 'dark', 
          position: 'bottom', // <-- Alterado para baixo
          cssClass: 'toast-acima-do-botao' // <-- Nova classe
        });
        await toast.present();
        
        this.navCtrl.navigateBack('/tabs/tab1');
      }
    }
  }

  async limparProdutos() {
    if (this.listaAtual && this.listaAtual.produtos) {
      this.listaAtual.produtos = []; 
      this.listaAtual.totalItens = 0;
      this.listaAtual.dataEdicao = 'Esvaziada agora mesmo';
      
      this.calcularProgresso(); 
      await this.listasService.guardarAlteracoes(); 

      const toast = await this.toastCtrl.create({
        message: 'Todos os produtos foram removidos da lista.',
        duration: 2500,
        color: 'dark',
        position: 'bottom', // <-- Alterado para baixo
        cssClass: 'toast-acima-do-botao' // <-- Nova classe
      });
      await toast.present();
    }
  }

  async removerProduto(produto: any, slidingItem: any) {
    slidingItem.close(); 

    if (this.listaAtual && this.listaAtual.produtos) {
      // 1. Encontra a posição exata daquela linha específica na lista
      const index = this.listaAtual.produtos.indexOf(produto);
      
      // 2. Se encontrou, apaga APENAS esse elemento (1)
      if (index > -1) {
        this.listaAtual.produtos.splice(index, 1);
        
        this.listaAtual.totalItens = this.listaAtual.produtos.length;
        this.listaAtual.dataEdicao = 'Atualizada agora mesmo';

        this.calcularProgresso(); 
        await this.listasService.guardarAlteracoes();

        const toast = await this.toastCtrl.create({
          message: `${produto.nome} removido.`,
          duration: 2000,
          color: 'dark',
          position: 'bottom',
          cssClass: 'toast-acima-do-botao'
        });
        await toast.present();
      }
    }
  }

  async ligarDetetores() {
    this.networkListener = await Network.addListener('networkStatusChange', async status => {
      if (status.connected) { this.esconderAviso(); } else { this.mostrarAvisoOffline(); }
    });
    window.addEventListener('online', () => this.esconderAviso());
    window.addEventListener('offline', () => this.mostrarAvisoOffline());
  }

  async esconderAviso() {
    this.isOffline = false;
    if (this.avisoOffline) {
      await this.avisoOffline.dismiss();
      this.avisoOffline = null;
      const toast = await this.toastCtrl.create({
        message: 'Ligação restaurada. Sincronizado!', 
        duration: 2500, 
        color: 'success', 
        icon: 'wifi-outline', 
        position: 'bottom', // <-- Alterado para baixo
        cssClass: 'toast-acima-do-botao' // <-- Nova classe
      });
      await toast.present();
    }
  }

  async mostrarAvisoOffline() {
    this.isOffline = true;
    
    if (this.avisoOffline) return; 
    
    this.avisoOffline = await this.toastCtrl.create({
      message: 'A funcionar em modo offline. As alterações estão a ser guardadas.', 
      color: 'dark', 
      icon: 'cloud-offline-outline', 
      position: 'bottom', // <-- Alterado para baixo
      duration: 3500,
      cssClass: 'toast-acima-do-botao' // <-- Nova classe
    });

    this.avisoOffline.onDidDismiss().then(() => {
      this.avisoOffline = null;
    });

    await this.avisoOffline.present();
  }

  async riscarProduto(produto: any, slidingItem: any) {
    produto.riscado = !produto.riscado; 
    slidingItem.close(); 
    this.calcularProgresso(); 
    await this.listasService.guardarAlteracoes(); 

    const status = await Network.getStatus();
    if (!status.connected || !navigator.onLine) {
      this.mostrarAvisoOffline();
    }
  }

  calcularProgresso() {
    if (this.listaAtual && this.listaAtual.produtos && this.listaAtual.produtos.length > 0) {
      this.marcados = this.listaAtual.produtos.filter((p: any) => p.riscado).length;
      this.progresso = Math.round((this.marcados / this.listaAtual.produtos.length) * 100);
    }
  }
}