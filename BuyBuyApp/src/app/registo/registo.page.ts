import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular'; // Importante para as mensagens de erro!
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // <-- Importes do Reactive Forms
import { StringsService } from '../services/strings.service'; // <-- Import do StringsService

@Component({
  selector: 'app-registo',
  templateUrl: './registo.page.html',
  styleUrls: ['./registo.page.scss'],
  standalone: false,
})
export class RegistoPage implements OnInit {
  
  mostrarSenha = false;
  registoForm!: FormGroup; // <-- Declaração do formulário reativo

  // Adicionámos o FormBuilder ao construtor
  constructor(
    private router: Router, 
    private toastCtrl: ToastController,
    private fb: FormBuilder,
    public strings: StringsService // <-- Injeção do serviço
  ) { }

  ngOnInit() {
    // Inicialização do formulário com validações robustas
    this.registoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
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
      color: 'danger', // Fica vermelho
      position: 'top'
    });
    toast.present();
  }

  async criarConta() {
    // Validação reativa antes de submeter
    if (this.registoForm.invalid) {
      const controls = this.registoForm.controls;
      
      if (controls['nome'].errors) {
        if (controls['nome'].errors['required']) {
          this.mostrarErro('Por favor, insira o seu nome!');
        } else {
          this.mostrarErro('O nome deve ter pelo menos 2 caracteres!');
        }
        return;
      }
      
      if (controls['email'].errors) {
        if (controls['email'].errors['required']) {
          this.mostrarErro('Por favor, insira o seu e-mail!');
        } else {
          this.mostrarErro('Por favor, insira um e-mail válido!');
        }
        return;
      }
      
      if (controls['senha'].errors) {
        if (controls['senha'].errors['required']) {
          this.mostrarErro('Por favor, defina uma palavra-passe!');
        } else {
          this.mostrarErro('A palavra-passe deve ter pelo menos 6 caracteres!');
        }
        return;
      }
      return;
    }

    const { nome, email, senha } = this.registoForm.value;

    // 1. Vai buscar a LISTA de contas (se não houver, cria uma lista vazia)
    let contas = JSON.parse(localStorage.getItem('contasRegistadas') || '[]');

    // 2. Verifica se alguém já usou este email
    const emailJaExiste = contas.find((c: any) => c.email === email);
    if (emailJaExiste) {
      this.mostrarErro('Este email já está registado na aplicação!');
      return;
    }

    // 3. Cria a conta nova e adiciona à lista
    const conta = {
      nome: nome,
      email: email,
      senha: senha
    };
    contas.push(conta); 
    
    // 4. Guarda a lista completa com todas as contas juntas
    localStorage.setItem('contasRegistadas', JSON.stringify(contas));

    // Guarda a sessão de quem acabou de entrar
    localStorage.setItem('utilizadorAtual', nome);
    localStorage.setItem('emailAtual', email);

    this.router.navigate(['/tabs/tab1']);
  }
}