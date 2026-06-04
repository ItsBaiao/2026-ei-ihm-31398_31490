import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ListasService, Lista } from '../services/listas.service';
import { Network } from '@capacitor/network'; // O Detetor Nativo!

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
  private networkListener: any; // O espião nativo

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

    this.ligarDetetorDeInternet();
  }

  // Verifica a net com hardware real mal a página entra
  async ionViewDidEnter() {
    const status = await Network.getStatus();
    if (!status.connected) {
      this.mostrarAvisoOffline();
    }
  }

  ngOnDestroy() {
    // Remove o espião ao sair da página
    if (this.networkListener) {
      this.networkListener.remove();
    }
  }

  async ligarDetetorDeInternet() {
    // Fica à escuta de mudanças na placa de rede do telemóvel
    this.networkListener = await Network.addListener('networkStatusChange', async status => {
      if (status.connected) {
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
      } else {
        this.mostrarAvisoOffline();
      }
    });
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

    // Verifica sempre pelo hardware antes de mostrar
    const status = await Network.getStatus();
    if (!status.connected) {
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