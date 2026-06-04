import { Component } from '@angular/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  
  constructor() {
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
  }
}