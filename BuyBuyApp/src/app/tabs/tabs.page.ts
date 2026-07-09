import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit, OnDestroy {
  public unreadChatsCount: number = 0;
  private intervalId: any = null;
  private supabaseService = inject(SupabaseService);

  ngOnInit() {
    this.iniciarVerificacao();
  }

  ngOnDestroy() {
    this.pararVerificacao();
  }

  iniciarVerificacao() {
    this.verificarNaoLidas();
    this.intervalId = setInterval(() => {
      this.verificarNaoLidas();
    }, 4000); // Verifica a cada 4 segundos
  }

  pararVerificacao() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async verificarNaoLidas() {
    const email = localStorage.getItem('emailAtual');
    if (email) {
      this.unreadChatsCount = await this.supabaseService.checkUnreadChatsCount(email);
    } else {
      this.unreadChatsCount = 0;
    }
  }
}
