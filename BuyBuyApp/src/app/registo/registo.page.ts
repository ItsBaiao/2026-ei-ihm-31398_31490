import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular'; // Importante para as mensagens de erro!

@Component({
  selector: 'app-registo',
  templateUrl: './registo.page.html',
  styleUrls: ['./registo.page.scss'],
  standalone: false,
})
export class RegistoPage implements OnInit {
  
  mostrarSenha = false;
  nomeInput: string = '';
  emailInput: string = '';
  senhaInput: string = ''; // Variável da password

  // Adicionámos o ToastController ao construtor
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
      color: 'danger', // Fica vermelho
      position: 'top'
    });
    toast.present();
  }

  async criarConta() {
    if (this.nomeInput.trim() === '' || this.emailInput.trim() === '' || this.senhaInput.trim() === '') {
      this.mostrarErro('Por favor, preencha todos os campos!');
      return;
    }

    if (!this.emailInput.includes('@') || !this.emailInput.includes('.')) {
      this.mostrarErro('Por favor, insira um email válido!');
      return;
    }

    // 1. Vai buscar a LISTA de contas (se não houver, cria uma lista vazia)
    let contas = JSON.parse(localStorage.getItem('contasRegistadas') || '[]');

    // 2. Verifica se alguém já usou este email
    const emailJaExiste = contas.find((c: any) => c.email === this.emailInput);
    if (emailJaExiste) {
      this.mostrarErro('Este email já está registado na aplicação!');
      return;
    }

    // 3. Cria a conta nova e adiciona à lista
    const conta = {
      nome: this.nomeInput,
      email: this.emailInput,
      senha: this.senhaInput
    };
    contas.push(conta); 
    
    // 4. Guarda a lista completa com todas as contas juntas
    localStorage.setItem('contasRegistadas', JSON.stringify(contas));

    // Guarda a sessão de quem acabou de entrar
    localStorage.setItem('utilizadorAtual', this.nomeInput);
    localStorage.setItem('emailAtual', this.emailInput);

    this.router.navigate(['/tabs/tab1']);
  }
}