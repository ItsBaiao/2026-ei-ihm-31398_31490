USO DE INTELIGÊNCIA ARTIFICIAL

Ao longo do desenvolvimento deste projeto, recorri a ferramentas de Inteligência Artificial (LLM) estritamente como assistentes de codificação e otimização de tempo, garantindo que a lógica e a arquitetura da aplicação refletem a minha própria visão do design (desenhado no Figma). A ajuda incidiu nos seguintes pontos:

1. Otimização de Interface (IHM): Auxílio na transcrição do design estático para código CSS/SCSS (ex: cartões de navegação, modal de cores e botões dinâmicos).
2. Funcionalidade M3 (Swipe Offline): Consulta da documentação do Ionic via IA para a implementação rápida do `<ion-item-sliding>` e gestão de estado assíncrono com o LocalStorage.
3. Integração Nativa (Requisito 12): Ajuda na configuração do plugin `@capacitor/network` para deteção de falhas de rede diretamente no hardware do dispositivo, de forma a acionar o modo offline.
4. Sincronização de Estado: Utilização do ciclo de vida do Ionic (`ionViewWillEnter` e `ionViewDidEnter`) sugerido pela IA para garantir a atualização em tempo real entre a lista de compras e o Modo Loja (M2).

Todas as sugestões de código foram analisadas, adaptadas e integradas manualmente por mim para garantir a coesão da aplicação.