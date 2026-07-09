import { Injectable, inject } from '@angular/core';
import { ListasService } from './listas.service';

export interface OrderItem {
  nome: string;
  quantidade: number;
  preco: string;
  imagemUrl?: string;
}

export interface DeliveryOrder {
  id: string;
  data: string;
  loja: string;
  morada: string;
  pagamento: string;
  itens: OrderItem[];
  subtotal: number;
  taxaEntrega: number;
  total: number;
  estado: 'Pendente' | 'Preparação' | 'A Caminho' | 'Entregue';
  estafeta: string;
  estafetaTelefone: string;
  minutosRestantes: number;
  timestampCriado: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  public activeOrder: DeliveryOrder | null = null;
  public ordersHistory: DeliveryOrder[] = [];
  
  private listasService = inject(ListasService);
  private timerInterval: any = null;

  constructor() {
    this.carregarDados();
    this.verificarEstadoEncomendaAtiva();
  }

  private carregarDados() {
    const active = localStorage.getItem('buybuy_active_order');
    if (active) {
      this.activeOrder = JSON.parse(active);
    }

    const history = localStorage.getItem('buybuy_orders_history');
    if (history) {
      this.ordersHistory = JSON.parse(history);
    }
  }

  private guardarDados() {
    if (this.activeOrder) {
      localStorage.setItem('buybuy_active_order', JSON.stringify(this.activeOrder));
    } else {
      localStorage.removeItem('buybuy_active_order');
    }
    localStorage.setItem('buybuy_orders_history', JSON.stringify(this.ordersHistory));
  }

  // Verifica o estado da encomenda ativa com base no tempo real decorrido desde a criação
  public verificarEstadoEncomendaAtiva() {
    if (!this.activeOrder) return;

    const agora = Date.now();
    const decorridoSegundos = Math.floor((agora - this.activeOrder.timestampCriado) / 1000);

    if (decorridoSegundos < 15) {
      this.activeOrder.estado = 'Pendente';
      this.activeOrder.minutosRestantes = 25;
    } else if (decorridoSegundos < 45) {
      this.activeOrder.estado = 'Preparação';
      this.activeOrder.minutosRestantes = 18;
    } else if (decorridoSegundos < 90) {
      this.activeOrder.estado = 'A Caminho';
      this.activeOrder.minutosRestantes = 8;
    } else {
      // Encomenda foi entregue!
      this.activeOrder.estado = 'Entregue';
      this.activeOrder.minutosRestantes = 0;
      
      // Move para o histórico
      const existeNoHistorico = this.ordersHistory.some(o => o.id === this.activeOrder!.id);
      if (!existeNoHistorico) {
        this.ordersHistory.unshift({ ...this.activeOrder });
      }
      this.guardarDados();
      this.pararMonitorizacao();
      return;
    }

    this.guardarDados();
    this.iniciarMonitorizacao();
  }

  public iniciarMonitorizacao() {
    if (this.timerInterval) return;

    this.timerInterval = setInterval(() => {
      this.verificarEstadoEncomendaAtiva();
    }, 3000); // Atualiza a cada 3 segundos
  }

  public pararMonitorizacao() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public finalizarPedidoEntregue() {
    this.activeOrder = null;
    this.guardarDados();
    this.pararMonitorizacao();
  }

  // Cria uma nova encomenda
  public criarEncomenda(
    loja: string,
    morada: string,
    pagamento: string,
    itens: OrderItem[],
    subtotal: number,
    taxaEntrega: number
  ): DeliveryOrder {
    const estafetas = [
      { nome: 'Carlos Silva', telf: '912 345 678' },
      { nome: 'Ana Rodrigues', telf: '934 567 890' },
      { nome: 'Rui Martins', telf: '967 890 123' }
    ];
    const estafetaSelecionado = estafetas[Math.floor(Math.random() * estafetas.length)];

    const novaEncomenda: DeliveryOrder = {
      id: 'order_' + Date.now().toString(),
      data: new Date().toLocaleDateString('pt-PT') + ' ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      loja,
      morada,
      pagamento: pagamento.toUpperCase(),
      itens,
      subtotal,
      taxaEntrega,
      total: subtotal + taxaEntrega,
      estado: 'Pendente',
      estafeta: estafetaSelecionado.nome,
      estafetaTelefone: estafetaSelecionado.telf,
      minutosRestantes: 25,
      timestampCriado: Date.now()
    };

    this.activeOrder = novaEncomenda;
    this.guardarDados();
    this.iniciarMonitorizacao();
    return novaEncomenda;
  }

  public cancelarEncomendaAtiva() {
    if (!this.activeOrder) return;
    this.pararMonitorizacao();
    this.activeOrder = null;
    this.guardarDados();
  }

  public adicionarCompraConcluida(loja: string, itens: OrderItem[], total: number) {
    const novaCompra: DeliveryOrder = {
      id: 'pur_' + Date.now().toString(),
      data: new Date().toLocaleDateString('pt-PT') + ' ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      loja: loja || 'ÉBarato',
      morada: 'Compra Presencial',
      pagamento: 'PRESENCIAL',
      itens,
      subtotal: total,
      taxaEntrega: 0,
      total: total,
      estado: 'Entregue',
      estafeta: 'Próprio',
      estafetaTelefone: '',
      minutosRestantes: 0,
      timestampCriado: Date.now()
    };
    
    this.ordersHistory.unshift(novaCompra);
    this.guardarDados();
  }
}
