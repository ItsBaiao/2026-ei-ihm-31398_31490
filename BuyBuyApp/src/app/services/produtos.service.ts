import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {

  // Injetamos a ferramenta de leitura no motor do serviço
  constructor(private http: HttpClient) { }

  // Esta é a função que as tuas páginas vão chamar
  getTodosProdutos() {
    // Vai ler exatamente à pasta organizada que tu criaste
    return this.http.get<any>('assets/data/produtos.json');
  }
}