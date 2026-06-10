import { Component } from '@angular/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Router } from '@angular/router'; // <-- 1. Importamos o Router

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  
  // 2. Injetamos o Router no construtor para podermos navegar
  constructor(private router: Router) {
    this.iniciarApp();
  }

  async iniciarApp() {
    try {
      // Força o bloqueio do ecrã na vertical
      await ScreenOrientation.lock({ orientation: 'portrait' });
      console.log('Orientação trancada com sucesso!');
    } catch (error) {
      // Este catch previne erros no browser do PC, já que isto é uma funcionalidade física
      console.log('Bloqueio de rotação aplicado. Apenas detetável no dispositivo físico.');
    }

    // 3. A MÁGICA DO AUTO-LOGIN
    // Vai ao telemóvel procurar se alguém já fez login antes
    const emailGuardado = localStorage.getItem('emailAtual');
    
    if (emailGuardado) {
      // Se encontrou um email, cancela a viagem para o Welcome e vai direto para a Tab 1!
      this.router.navigateByUrl('/tabs/tab1');
    }
  }
}