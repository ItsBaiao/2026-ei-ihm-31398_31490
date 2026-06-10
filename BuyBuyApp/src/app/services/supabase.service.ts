import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    // Liga a tua app ao teu projeto Supabase usando as chaves do environment
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Função mágica que pega no ficheiro e envia para a nuvem
  async uploadImagemProduto(file: File | Blob, fileName: string): Promise<string | null> {
    try {
      // 1. Faz o upload para o balde "produtos" dentro da pasta "imagens"
      const { data, error } = await this.supabase.storage
        .from('produtos')
        .upload(`imagens/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true // Se já existir uma foto com o mesmo nome, substitui
        });

      if (error) {
        console.error('Erro do Supabase ao fazer upload:', error.message);
        return null;
      }

      // 2. Se correu bem, pede o link público da foto para podermos mostrar na app
      const { data: publicUrlData } = this.supabase.storage
        .from('produtos')
        .getPublicUrl(`imagens/${fileName}`);

      return publicUrlData.publicUrl;

    } catch (err) {
      console.error('Erro inesperado no upload:', err);
      return null;
    }
  }
}