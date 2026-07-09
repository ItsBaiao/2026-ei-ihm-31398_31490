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

  // --- ARMAZENAMENTO DE IMAGEM ---
  async uploadImagemProduto(file: File | Blob, fileName: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.storage
        .from('produtos')
        .upload(`imagens/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Erro do Supabase ao fazer upload:', error.message);
        return null;
      }

      const { data: publicUrlData } = this.supabase.storage
        .from('produtos')
        .getPublicUrl(`imagens/${fileName}`);

      return publicUrlData.publicUrl;

    } catch (err) {
      console.error('Erro inesperado no upload:', err);
      return null;
    }
  }

  // --- SYNC DE CONTAS DE UTILIZADOR ---
  async registarConta(email: string, nome: string, iniciais: string) {
    try {
      const { error } = await this.supabase
        .from('buybuy_contas')
        .upsert({ 
          email: email.toLowerCase().trim(), 
          nome, 
          iniciais 
        });
      if (error) console.error('Erro ao registar conta no Supabase:', error.message);
    } catch (err) {
      console.error('Erro inesperado ao registar conta:', err);
    }
  }

  async obterContas(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('buybuy_contas')
        .select('*');
      if (error) {
        console.error('Erro ao obter contas do Supabase:', error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('Erro inesperado ao obter contas:', err);
      return [];
    }
  }

  // --- SYNC DE AMIGOS ---
  async obterAmigos(userEmail: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('buybuy_amigos')
        .select('*')
        .eq('user_email', userEmail.toLowerCase().trim());
      
      if (error) {
        console.error('Erro ao obter amigos do Supabase:', error.message);
        return [];
      }
      return (data || []).map(row => ({
        nome: row.amigo_nome,
        email: row.amigo_email,
        iniciais: row.amigo_iniciais
      }));
    } catch (err) {
      console.error('Erro inesperado ao obter amigos:', err);
      return [];
    }
  }

  async adicionarAmigo(userEmail: string, amigoEmail: string, amigoNome: string, amigoIniciais: string) {
    try {
      const { error } = await this.supabase
        .from('buybuy_amigos')
        .insert({
          user_email: userEmail.toLowerCase().trim(),
          amigo_email: amigoEmail.toLowerCase().trim(),
          amigo_nome: amigoNome,
          amigo_iniciais: amigoIniciais
        });
      if (error) console.error('Erro ao adicionar amigo no Supabase:', error.message);
    } catch (err) {
      console.error('Erro inesperado ao adicionar amigo:', err);
    }
  }

  async removerAmigo(userEmail: string, amigoEmail: string) {
    try {
      const { error } = await this.supabase
        .from('buybuy_amigos')
        .delete()
        .eq('user_email', userEmail.toLowerCase().trim())
        .eq('amigo_email', amigoEmail.toLowerCase().trim());
      if (error) console.error('Erro ao remover amigo no Supabase:', error.message);
    } catch (err) {
      console.error('Erro inesperado ao remover amigo:', err);
    }
  }

  // --- SYNC DE MENSAGENS E LISTAS NO CHAT ---
  async obterMensagens(chatId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('buybuy_mensagens')
        .select('*')
        .eq('chat_id', chatId)
        .order('id', { ascending: true }); // Ordena por ID incremental
      
      if (error) {
        console.error('Erro ao obter mensagens do Supabase:', error.message);
        return [];
      }
      return (data || []).map(row => ({
        id: row.id,
        remetente: row.remetente,
        remetenteNome: row.remetente_nome,
        texto: row.texto,
        data: row.data,
        tipo: row.tipo,
        listaDados: row.lista_dados
      }));
    } catch (err) {
      console.error('Erro inesperado ao obter mensagens:', err);
      return [];
    }
  }

  async enviarMensagem(chatId: string, remetente: string, remetenteNome: string, texto: string, tipo: string, listaDados: any) {
    try {
      const { error } = await this.supabase
        .from('buybuy_mensagens')
        .insert({
          chat_id: chatId,
          remetente: remetente.toLowerCase().trim(),
          remetente_nome: remetenteNome,
          texto: texto,
          tipo: tipo,
          lista_dados: listaDados,
          data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      if (error) console.error('Erro ao enviar mensagem para o Supabase:', error.message);
    } catch (err) {
      console.error('Erro inesperado ao enviar mensagem:', err);
    }
  }

  // --- SYNC DE GRUPOS ---
  async obterGrupos(userEmail: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('buybuy_grupos')
        .select('*');
      
      if (error) {
        console.error('Erro ao obter grupos do Supabase:', error.message);
        return [];
      }
      if (!data) return [];
      
      // Filtra os grupos onde o utilizador atual é um dos membros
      return data.filter((g: any) => 
        g.membros.map((m: string) => m.toLowerCase().trim()).includes(userEmail.toLowerCase().trim())
      );
    } catch (err) {
      console.error('Erro inesperado ao obter grupos:', err);
      return [];
    }
  }

  async criarGrupo(id: string, nome: string, criador: string, membros: string[], iniciais: string) {
    try {
      const { error } = await this.supabase
        .from('buybuy_grupos')
        .insert({
          id,
          nome,
          criador: criador.toLowerCase().trim(),
          membros: membros.map(m => m.toLowerCase().trim()),
          iniciais
        });
      if (error) console.error('Erro ao criar grupo no Supabase:', error.message);
    } catch (err) {
      console.error('Erro inesperado ao criar grupo:', err);
    }
  }

  async atualizarMembrosGrupo(grupoId: string, membros: string[]) {
    try {
      const { error } = await this.supabase
        .from('buybuy_grupos')
        .update({ membros: membros.map(m => m.toLowerCase().trim()) })
        .eq('id', grupoId);
      if (error) console.error('Erro ao atualizar membros do grupo no Supabase:', error.message);
    } catch (err) {
      console.error('Erro inesperado ao atualizar membros:', err);
    }
  }

  async excluirGrupo(grupoId: string) {
    try {
      const { error } = await this.supabase
        .from('buybuy_grupos')
        .delete()
        .eq('id', grupoId);
      if (error) console.error('Erro ao excluir grupo no Supabase:', error.message);
    } catch (err) {
      console.error('Erro inesperado ao excluir grupo:', err);
    }
  }

  async checkUnreadChatsCount(emailAtual: string): Promise<number> {
    if (!emailAtual) return 0;
    try {
      // 1. Obter todos os amigos para gerar os chatIds
      const amigos = await this.obterAmigos(emailAtual);
      const chatIds: string[] = amigos.map(amigo => {
        const emails = [emailAtual.toLowerCase().trim(), amigo.email.toLowerCase().trim()].sort();
        return `chat_${emails[0]}_${emails[1]}`;
      });

      // 2. Obter todos os grupos para gerar os chatIds
      const grupos = await this.obterGrupos(emailAtual);
      grupos.forEach(grupo => {
        chatIds.push(`chat_group_${grupo.id}`);
      });

      if (chatIds.length === 0) return 0;

      // 3. Obter todas as mensagens recentes desses chats
      const { data, error } = await this.supabase
        .from('buybuy_mensagens')
        .select('chat_id, remetente, id')
        .in('chat_id', chatIds)
        .order('id', { ascending: true });

      if (error || !data) return 0;

      // Agrupar mensagens por chat_id
      const chatsMap: { [chatId: string]: any[] } = {};
      data.forEach(row => {
        if (!chatsMap[row.chat_id]) {
          chatsMap[row.chat_id] = [];
        }
        chatsMap[row.chat_id].push(row);
      });

      // 4. Calcular quantos chats têm mensagens não lidas
      let unreadChats = 0;
      Object.keys(chatsMap).forEach(chatId => {
        const chatMessages = chatsMap[chatId];
        let lastReadIdVal = localStorage.getItem(`chat_last_read_id_${emailAtual.toLowerCase().trim()}_${chatId}`);
        if (lastReadIdVal === null) {
          const maxId = chatMessages.reduce((max, msg) => msg.id > max ? msg.id : max, 0);
          localStorage.setItem(`chat_last_read_id_${emailAtual.toLowerCase().trim()}_${chatId}`, maxId.toString());
          lastReadIdVal = maxId.toString();
        }
        const lastReadId = parseInt(lastReadIdVal || '0', 10);

        const unreadMsgs = chatMessages.filter(msg => 
          msg.id > lastReadId && 
          msg.remetente.toLowerCase().trim() !== emailAtual.toLowerCase().trim()
        );

        if (unreadMsgs.length > 0) {
          unreadChats++;
        }
      });

      return unreadChats;
    } catch (err) {
      console.error('Erro ao verificar chats não lidos:', err);
      return 0;
    }
  }

  async obterMensagensPorChatIds(chatIds: string[]): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('buybuy_mensagens')
        .select('chat_id, remetente, id')
        .in('chat_id', chatIds);
      if (error) {
        console.error('Erro ao obter mensagens em lote do Supabase:', error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('Erro inesperado ao obter mensagens em lote:', err);
      return [];
    }
  }
}