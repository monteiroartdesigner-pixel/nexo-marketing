# NEXO Marketing

Painel do NEXO Marketing (equipe de onças que cria e publica conteúdo), separado do NEXO Prospect.

- Endereço: https://marketing.nexoprospect.com (só o Master entra; clientes usam nexoprospect.com)
- Origem: `marketing.html` + `assets/` do repositório `nexo-painel` (ver `docs/ORIGEM.txt`, só local)
- Banco: o mesmo Supabase do Prospect (login único). A trava "só Master" fica em `iniciar()` no
  `site/index.html` e usa o campo `plataforma` de `nexo_contexto`; o banco confere cada função de novo.

## Estúdio (fase 1 da versão 2.0, 26/11/2026)

Aba **Estúdio** com as skills de escrita do [instagram-agent-skill](https://github.com/Jakeschincariol/instagram-agent-skill)
(Jake Schincariol, licença MIT), em português:

- Rodam no navegador, sem custo e sem enviar nada: nota do gancho, 26 fórmulas de gancho, revisão de legenda,
  limpeza do jeito de IA e tempo do roteiro (`site/assets/estudio-*.js`).
- **Pedir à equipe** (roteiro de Reels, carrossel ou Stories) usa a fila do Pedir peça (`nexo_pedir_ideias`);
  o resultado chega em Aprovar. As instruções do cérebro para esses pedidos estão em `cerebro/ESTUDIO.md`.
- Original das skills, com a licença: `skills-terceiros/instagram-agent-skill/`.
- Testes: `node --test testes/`

## Rodar no computador

```powershell
python -m http.server 8790 --directory site
```

Abra http://127.0.0.1:8790.

## Publicar

Todo push na `main` que mexe em `site/` publica sozinho pelo GitHub Pages (`.github/workflows/pages.yml`).

## Ainda aponta para nexoprospect.com

- Volta do "Entrar com Facebook/Google" (as funções do servidor devolvem para nexoprospect.com/marketing).
- Aba de leads (fica no Prospect).
