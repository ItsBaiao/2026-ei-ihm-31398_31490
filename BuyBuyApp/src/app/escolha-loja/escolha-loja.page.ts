import { Component } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { ListasService } from '../services/listas.service';

@Component({
  selector: 'app-escolha-loja',
  templateUrl: './escolha-loja.page.html',
  styleUrls: ['./escolha-loja.page.scss'],
  standalone: false
})
export class EscolhaLojaPage {

  public lojas: any[] = [];
  public lojaAtual: any;
  public searchQuery: string = '';

  get lojasFiltradas(): any[] {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return this.lojas;
    }
    const query = this.searchQuery.toLowerCase().trim();
    return this.lojas.filter(l => 
      l.nome.toLowerCase().includes(query) || 
      l.morada.toLowerCase().includes(query)
    );
  }

  constructor(
    private navCtrl: NavController, 
    private toastCtrl: ToastController,
    private listasService: ListasService
  ) { }

  ionViewWillEnter() {
    this.lojas = this.listasService.lojasDoSistema;
    this.lojaAtual = this.listasService.lojaSelecionadaGlobal;
  }

  selecionarLoja(loja: any) {
    if (loja.ativa) {
      this.listasService.lojaSelecionadaGlobal = loja; 
      this.navCtrl.back(); 
    } else {
      this.mostrarEmDesenvolvimento();
    }
  }

  async mostrarEmDesenvolvimento() {
    const toast = await this.toastCtrl.create({
      message: 'Loja ainda não integrada no sistema! 🚧',
      duration: 2500,
      color: 'warning',
      position: 'top'
    });
    toast.present();
  }
}