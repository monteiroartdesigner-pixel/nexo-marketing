# Regras de vídeo do NEXO Marketing

Valem para todo vídeo de Reels e Stories que o NEXO Marketing cria, pede à equipe ou edita. Vêm das regras do
Estúdio NEXO (`D:\RICARDO DESIGNER\SITES\INSTAGRAM\meus-videos\CLAUDE.md` e `estilo/GUIA-DE-ESTILO.md`, aprovadas
pelo Ricardo desde 09/11/2026) e das decisões de 27/11/2026 sobre voz e visual. Se uma regra mudar lá, mude aqui também.

## Formato
- Reels e Stories: **1080×1920, 30 qps, H.264 e AAC**, voz em **−14 LUFS**.
- Duração: **de 20 a 45 s**. Tutorial de sistema (gravação de tela): cerca de 90 s.
- Exceção: vídeo de explicação para o próprio Ricardo, que não vai ao ar, pode ser 16:9 e mais longo.

## Estrutura
- **Gancho de 0 a 3 s:** a frase mais forte, falada e escrita na tela. Sem "oi, gente" e sem logo no começo.
- **Legenda:** palavra por palavra, até 3 palavras por bloco, ortografia certa, NEXO sempre em caixa alta, números e
  palavras-chave em destaque, dentro da zona segura. Nunca repetir na legenda um texto que já está grande na tela.
- **Efeito sonoro:** pouco e com função (entrada do gancho, troca de assunto, número). No máximo um a cada 4 ou 5 s.
- **Música:** baixa, atrás da voz. Para alcance, a música pode entrar pelo app do Instagram.
- **Chamada:** uma palavra-chave para comentar (no NEXO Prospect: **PROSPECT**).
- **Story:** topo de 250 px e pé de 340 px livres (o Instagram cobre com o nome do perfil e a caixa de resposta).
  Figurinha e link vão pelo app.

## Verdade
Só fatos aprovados. No NEXO Prospect: sem preço, sem teste grátis, sem cliente e sem resultado. Tela do produto,
só a real e com dados de exemplo, dizendo isso na própria imagem.

## Voz (decisão de 27/11/2026: ferramentas grátis)
1. **Padrão:** edge-tts, voz `pt-BR-AntonioNeural` (grátis), número e sigla por extenso no texto falado
   ("Nexo Próspect", "três vezes").
2. **Melhor opção:** a voz do próprio Ricardo, gravada no celular a partir do roteiro.
3. **ElevenLabs (voz Thales):** só com o OK do Ricardo, porque hoje exige plano pago.

## Visual por marca
| Marca | Cores | Fontes |
|---|---|---|
| NEXO Prospect e @nexo.rm | azul-noite (#07122B a #0B1E46) e dourado #F2B632 numa palavra por vez | Syne ou Unbounded 800 nos títulos, Inter no texto |
| NEXO Design & Automação (sistemas e tutoriais de cliente) | azul-marinho, azul #2B8CEB, ciano #3CC4E6 | Poppins |
| NEXO VÁRZEA e NEXO SPORT | o visual de cada app | o de cada app |

## Onde está aplicado
- `video/montar.py` (vídeo do Estúdio): voz em −14 LUFS.
- Estúdio › Tempo do roteiro: avisa quando o Reels sai fora de 20 a 45 s.
- Cérebro (seção 3d de `cerebro/INSTRUCOES.md` do agente): roteiros de Reels de 20 a 45 s, gancho falado e escrito,
  chamada com palavra-chave.
- Vídeo da mesa e do monitor (`E:\CLAUDE\nexo-monitor-prospect`, v4): legenda palavra por palavra e −14 LUFS.
