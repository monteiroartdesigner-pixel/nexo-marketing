# NEXO Marketing

Painel do NEXO Marketing (equipe de onças que cria e publica conteúdo), separado do NEXO Prospect.

- Endereço: https://marketing.nexoprospect.com (só o Master entra; clientes usam nexoprospect.com)
- Origem: `marketing.html` + `assets/` do repositório `nexo-painel` (ver `docs/ORIGEM.txt`, só local)
- Banco: o mesmo Supabase do Prospect (login único). A trava "só Master" fica em `iniciar()` no
  `site/index.html` e usa o campo `plataforma` de `nexo_contexto`; o banco confere cada função de novo.

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
