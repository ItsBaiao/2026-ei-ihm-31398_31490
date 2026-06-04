import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // O nosso "motorista"

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  mostrarSenha = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  toggleSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  iniciarSessao() {
    // Força a ida para a Tab 1 (As minhas listas)
    this.router.navigate(['/tabs/tab1']);
  }

}