# 3c. Pedidos do Estúdio (aba Estúdio do NEXO Marketing)

Seção pronta para entrar em `cerebro/INSTRUCOES.md` do agente (depois da 3a). Ainda **não** foi colocada lá:
espera o OK do Ricardo, porque outra sessão mexe naquele repositório.

**Quando fazer:** um pedido de `estado.json › pedidos_ideias` cujo `texto` começa com `[Estúdio · `.
Ele segue tudo da seção 3a (marca, fatos aprovados, `pedido_id`, `pedidos_sem_resultado`), mais o que vem abaixo.
O tema é o que vem depois do `]`. Faça **uma** peça por pedido.

Base: as skills `ig-reel`, `ig-carousel` e `ig-story` do instagram-agent-skill (Jake Schincariol, licença MIT),
em `skills-terceiros/instagram-agent-skill/` do repositório nexo-marketing. As 26 fórmulas em português estão em
`site/assets/estudio-ganchos.js`, e a nota e os tempos em `site/assets/estudio-ferramentas.js`
(`node -e` roda as duas funções: `estNotaGancho` e `estTempos`).

## `[Estúdio · Roteiro de Reels…]` → `formato: "reel"`
1. Escolha **três fórmulas diferentes** que sirvam ao tema e escreva, para cada uma, a frase falada e o texto da tela
   (até 6 palavras). Dê a nota de cada frase falada com `estNotaGancho`. Se a melhor ficar abaixo de 50, reescreva:
   ainda não é o gancho.
2. Escreva o roteiro no gancho vencedor, uma fala por linha, do jeito que o Ricardo fala (voz da marca).
   Formato: gancho (0 a 2 s), o que está em jogo (até 7 s), corpo com uma ideia por trecho, entrega do que o gancho
   prometeu, uma chamada só, e a última fala repete uma palavra do gancho (laço).
3. Rode `estTempos(roteiro, 165, 30)` e corrija os alertas: gancho acima de 3 s, trecho acima de 4 s, três trechos
   seguidos sem nada concreto, sem laço.
4. Passe o texto pela limpeza (seção de humanizar): sem travessão, sem clichê de IA.
5. Na `arte`, entregue: os três ganchos com fórmula e nota, o roteiro em cenas com o tempo de cada uma, e o texto de
   cada tela com o tempo. Em `motivo_formato`: a fórmula escolhida, a nota e o tamanho (ex.: "Fórmula 3, Ninguém te
   conta, nota 86. 28 s em 9 trechos."). O Ricardo grava; nada é publicado.

## `[Estúdio · Carrossel…]` → `formato: "carrossel"`
Capa com o gancho (até 8 palavras) que faz arrastar, de 5 a 7 slides com uma ideia cada, o último com a chamada.
Legenda revisada pelas regras de `estLegenda`: primeira linha é o gancho e cabe nos 125 caracteres, até 5 hashtags,
uma chamada só, sem link.

## `[Estúdio · Sequência de Stories…]` → `formato: "story"`
De 3 a 5 telas para o mesmo dia. Em cada tela: o texto, a figurinha e por quê (enquete para descobrir, caixa de
pergunta para puxar conversa, link só na última). A última leva a pessoa a mandar mensagem primeiro (palavra-chave
no direct). Em `motivo_formato`, o objetivo da sequência.

## Não dá para fazer
Tema que pede fato, número, preço ou resultado fora de `fatos-aprovados.json`: liste em `pedidos_sem_resultado`
com o motivo, como na seção 3a. Nunca invente número para o gancho ficar mais forte.
