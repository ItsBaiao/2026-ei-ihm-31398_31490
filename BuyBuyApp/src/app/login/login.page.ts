import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular'; // Importante para as mensagens de erro!
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // <-- Importes do Reactive Forms
import { StringsService } from '../services/strings.service'; // <-- Import do StringsService

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  mostrarSenha = false;
  loginForm!: FormGroup; // <-- Declaração do formulário reativo

  // Adicionámos o FormBuilder ao construtor
  constructor(
    private router: Router, 
    private toastCtrl: ToastController,
    private fb: FormBuilder,
    public strings: StringsService // <-- Injeção do serviço
  ) { }

  ngOnInit() {
    // Inicialização do formulário com validações
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]]
    });
  }

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
    // Validação reativa antes de avançar
    if (this.loginForm.invalid) {
      const controls = this.loginForm.controls;
      
      if (controls['email'].errors) {
        if (controls['email'].errors['required']) {
          this.mostrarErro('Por favor, insira o seu e-mail!');
        } else {
          this.mostrarErro('Por favor, insira um e-mail válido!');
        }
        return;
      }
      
      if (controls['senha'].errors) {
        this.mostrarErro('Por favor, insira a palavra-passe!');
        return;
      }
      return;
    }

    const { email, senha } = this.loginForm.value;

    // 1. Vai buscar a LISTA de contas que criámos no Registo
    let contas = JSON.parse(localStorage.getItem('contasRegistadas') || '[]');

    if (contas.length === 0) {
      this.mostrarErro('Nenhuma conta encontrada no sistema.');
      return;
    }

    // 2. Procura a conta exata (tem de bater certo o email e a password)
    const contaEncontrada = contas.find((c: any) => c.email === email && c.senha === senha);

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