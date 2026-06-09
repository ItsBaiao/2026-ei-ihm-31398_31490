import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular'; // Importado para as mensagens

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  
  public nomeUtilizador: string = 'Poupador';
  public iniciais: string = 'PO';
  public emailUtilizador: string = 'poupador@email.com';

  constructor(private router: Router, private toastCtrl: ToastController) {}

  ionViewWillEnter() {
    const userGuardado = localStorage.getItem('utilizadorAtual');
    if (userGuardado) {
      this.nomeUtilizador = userGuardado;
      this.gerarIniciais(userGuardado);
    }

    const emailGuardado = localStorage.getItem('emailAtual');
    if (emailGuardado) {
      this.emailUtilizador = emailGuardado;
    }
  }

  gerarIniciais(nome: string) {
    const nomes = nome.trim().split(' ');
    if (nomes.length > 1) {
      this.iniciais = nomes[0][0].toUpperCase() + nomes[nomes.length - 1][0].toUpperCase();
    } else {
      this.iniciais = nome.substring(0, 2).toUpperCase();
    }
  }

  terminarSessao() {
    localStorage.removeItem('utilizadorAtual');
    localStorage.removeItem('emailAtual');
    this.router.navigate(['/welcome']);
  }

  // NOVA FUNÇÃO: O aviso de "Em Desenvolvimento"
  async mostrarEmDesenvolvimento() {
    const toast = await this.toastCtrl.create({
      message: 'Funcionalidade ainda em desenvolvimento! 🚧',
      duration: 2500,
      color: 'warning',
      position: 'top'
    });
    toast.present();
  }
}