# Pedidos do Estúdio no cérebro

Desde 26/11/2026 as regras ficam na **seção 3d** de `cerebro/INSTRUCOES.md` do repositório do agente
(`nexo-varzea-agente`), que é o que a rotina do cérebro lê. Este arquivo só aponta para lá.

- Pedido: o Estúdio grava na fila do Pedir peça um texto que começa com `[Estúdio · Roteiro de Reels…]`,
  `[Estúdio · Carrossel…]` ou `[Estúdio · Sequência de Stories…]`, seguido do tema.
- Ferramentas do cérebro: `cerebro/estudio/` no agente (cópia de `site/assets/estudio-ganchos.js` e
  `site/assets/estudio-ferramentas.js` daqui, mais o `estudio.js` de linha de comando). A ponte
  `ferramentas/cerebro_repo.sh enviar` leva a pasta para o repositório do cérebro junto com as instruções.
- **Mudou alguma fórmula ou regra aqui?** Copie os dois arquivos para `cerebro/estudio/` do agente
  (`ganchos.js` e `ferramentas.js`), senão o cérebro e o painel dão notas diferentes.
- Reels: `arte.cenas` (tempo, fala, imagem) é o que o painel mostra em Aprovar, e `arte.ganchos` traz as
  três opções com fórmula e nota.
- Stories: uma peça por tela (o agente publica Story com uma imagem só); a figurinha vai escrita em
  `motivo_formato`, porque a API do Instagram não põe figurinha.
