import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Importamos o "motorista" que nos leva de página em página

@Component({
  selector: 'app-registo',
  templateUrl: './registo.page.html',
  styleUrls: ['./registo.page.scss'],
  standalone: false,
})
export class RegistoPage implements OnInit {
  
  // Variável que sabe se a password está visível ou escondida (começa falsa)
  mostrarSenha = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  // Função para o ícone do Olho
  toggleSenha() {
    this.mostrarSenha = !this.mostrarSenha; // Inverte o valor (se estava falso, passa a verdadeiro)
  }

  // Função para o Botão Criar Conta
  criarConta() {
    // No futuro, é aqui dentro que vais colocar o código para enviar os dados para uma base de dados real.
    // Por agora, dizemos apenas ao "motorista" para nos levar à força para a Tab 1:
    this.router.navigate(['/tabs/tab1']);
  }

}