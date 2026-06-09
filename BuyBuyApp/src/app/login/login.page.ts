import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular'; // Importante para as mensagens de erro!

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  mostrarSenha = false;
  emailInput: string = '';
  senhaInput: string = ''; // Variável da password

  constructor(private router: Router, private toastCtrl: ToastController) { }

  ngOnInit() {}

  toggleSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  // Função para mostrar a mensagem vermelha
  async mostrarErro(mensagem: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    toast.present();
  }

  async iniciarSessao() {
    if (this.emailInput.trim() === '' || this.senhaInput.trim() === '') {
      this.mostrarErro('Preencha o email e a palavra-passe!');
      return;
    }

    // 1. Vai buscar a LISTA de contas que criámos no Registo
    let contas = JSON.parse(localStorage.getItem('contasRegistadas') || '[]');

    if (contas.length === 0) {
      this.mostrarErro('Nenhuma conta encontrada no sistema.');
      return;
    }

    // 2. Procura a conta exata (tem de bater certo o email e a password)
    const contaEncontrada = contas.find((c: any) => c.email === this.emailInput && c.senha === this.senhaInput);

    if (!contaEncontrada) {
      this.mostrarErro('Email ou palavra-passe incorretos!');
      return;
    }
    
    // 3. Sucesso! Entra na conta certa
    localStorage.setItem('utilizadorAtual', contaEncontrada.nome);
    localStorage.setItem('emailAtual', contaEncontrada.email);

    this.router.navigate(['/tabs/tab1']);
  }
}