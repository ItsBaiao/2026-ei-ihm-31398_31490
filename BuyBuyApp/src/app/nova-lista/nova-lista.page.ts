import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ListasService, Lista } from '../services/listas.service';

@Component({
  selector: 'app-nova-lista',
  templateUrl: './nova-lista.page.html',
  styleUrls: ['./nova-lista.page.scss'],
  standalone: false
})
export class NovaListaPage implements OnInit {

  public isColorModalOpen = false;

  public nomeDaLista: string = ''; 
  public iconeEscolhido: string = 'cart-outline'; 
  public corEscolhida: string = 'border-dark'; 

  public corPersonalizada: string = '#FF0000';
  public hueValue: number = 0; 
  public lightnessValue: number = 50; 

  constructor(
    private listasService: ListasService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  setModalOpen(isOpen: boolean) {
    this.isColorModalOpen = isOpen;
  }

  selecionarIcone(icone: string) {
    this.iconeEscolhido = icone;
  }

  selecionarCor(cor: string) {
    this.corEscolhida = cor;
  }

  confirmarCorModal() {
    this.corEscolhida = this.corPersonalizada;
    this.setModalOpen(false);
  }

  atualizarCorPeloSlider(event: any) {
    this.hueValue = event.target.value;
    this.corPersonalizada = this.hslToHex(this.hueValue, 100, this.lightnessValue);
  }

  atualizarLuminosidadePeloSlider(event: any) {
    this.lightnessValue = event.target.value;
    this.corPersonalizada = this.hslToHex(this.hueValue, 100, this.lightnessValue);
  }

  hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  }

  guardarLista() {
    const nomeFinal = this.nomeDaLista.trim() !== '' ? this.nomeDaLista : 'Nova Lista';

    const nova: Lista = {
      nome: nomeFinal,
      icone: this.iconeEscolhido,
      cor: this.corEscolhida,
      dataEdicao: 'Criada agora mesmo',
      totalItens: 0,
      produtos: [] 
    };

    this.listasService.adicionarLista(nova);
    this.navCtrl.back();
  }
}