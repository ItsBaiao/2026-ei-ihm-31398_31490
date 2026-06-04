import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
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

  public avisoOffline: HTMLIonToastElement | null = null;
  private networkListener: any; 

  constructor(
    private route: ActivatedRoute,
    private listasService: ListasService,
    private toastCtrl: ToastController
  ) { }

  async ngOnInit() {
    await this.listasService.init();
    const nomeRecebido = this.route.snapshot.paramMap.get('nome');
    if (nomeRecebido) {
      this.listaAtual = this.listasService.minhasListas.find(l => l.nome === nomeRecebido);
      this.calcularProgresso();
    }

    this.ligarDetetores();
  }

  // Verifica mal a página abre (Híbrido: tenta o Nativo e o Web)
  async ionViewDidEnter() {
    const status = await Network.getStatus();
    if (!status.connected || !navigator.onLine) {
      this.mostrarAvisoOffline();
    }
  }

  ngOnDestroy() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
    window.removeEventListener('online', this.esconderAviso.bind(this));
    window.removeEventListener('offline', this.mostrarAvisoOffline.bind(this));
  }

  async ligarDetetores() {
    // 1. Detetor Nativo (Para o telemóvel físico)
    this.networkListener = await Network.addListener('networkStatusChange', async status => {
      if (status.connected) {
        this.esconderAviso();
      } else {
        this.mostrarAvisoOffline();
      }
    });

    // 2. Detetor Web (Para o browser e emulador teimoso)
    window.addEventListener('online', () => this.esconderAviso());
    window.addEventListener('offline', () => this.mostrarAvisoOffline());
  }

  async esconderAviso() {
    if (this.avisoOffline) {
      await this.avisoOffline.dismiss();
      this.avisoOffline = null;

      const toast = await this.toastCtrl.create({
        message: 'Ligação restaurada. Sincronizado!',
        duration: 2500,
        color: 'success',
        icon: 'wifi-outline',
        position: 'bottom'
      });
      await toast.present();
    }
  }

  async mostrarAvisoOffline() {
    if (this.avisoOffline) return; 

    this.avisoOffline = await this.toastCtrl.create({
      message: 'A funcionar em modo offline. As alterações estão a ser guardadas.',
      color: 'dark',
      icon: 'cloud-offline-outline',
      position: 'bottom'
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