// Testes das ferramentas do Estúdio. Rodar: node --test testes/
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const F = require("../site/assets/estudio-ferramentas.js");
const { EST_GANCHOS, EST_REGRAS_GANCHO } = require("../site/assets/estudio-ganchos.js");

test("26 fórmulas completas, ids de 1 a 26", () => {
  assert.equal(EST_GANCHOS.length, 26);
  assert.deepEqual(EST_GANCHOS.map(g => g.id), Array.from({ length: 26 }, (_, i) => i + 1));
  for (const g of EST_GANCHOS) for (const k of ["nome", "modelo", "exemplo", "tela", "serve", "armadilha"]) assert.ok(g[k] && g[k].length > 3, `${g.id}.${k}`);
  assert.equal(EST_REGRAS_GANCHO.length, 6);
});

test("gancho forte: número, tensão, fala com você, curto", () => {
  const r = F.estNotaGancho("Você perdeu R$ 18 mil por esquecer uma cláusula.");
  assert.equal(r.veredito, "forte", JSON.stringify(r));
  assert.ok(r.nota >= 70);
  assert.deepEqual(r.alertas, []);
});

test("gancho fraco: cumprimento e preparação viram alerta e derrubam a nota", () => {
  const r = F.estNotaGancho("Oi galera, neste vídeo eu vou mostrar umas dicas legais de marketing para vocês");
  assert.equal(r.veredito, "fraco");
  assert.ok(r.alertas.length >= 2, JSON.stringify(r.alertas));
  const fracos = F.estRankGanchos("Pare de rolar e veja isso\nVocê não precisa de nicho. Precisa de uma pessoa que você sabe o nome.");
  assert.match(fracos[0].gancho, /nicho/);
  assert.equal(fracos[1].alertas.length, 1);
});

test("os exemplos das fórmulas não caem em alerta de preparação ou cumprimento", () => {
  for (const g of EST_GANCHOS) {
    const r = F.estNotaGancho(g.exemplo);
    assert.ok(!r.alertas.some(a => /Cumprimento|Preparação|pare de rolar/.test(a)), `${g.id}: ${r.alertas}`);
  }
});

test("hashtag e emoji no gancho são eliminatórios", () => {
  assert.equal(F.estNotaGancho("Você perdeu R$ 18 mil #marketing").alertas.length, 1);
  assert.equal(F.estNotaGancho("Você perdeu R$ 18 mil 🔥").alertas.length, 1);
});

test("R$ 18.000 conta como uma palavra só", () => {
  assert.deepEqual(F.estPalavras("R$18.000 sumiu"), ["R$18000", "sumiu"]);
});

test("legenda: mostra os 125 caracteres, pega hashtag demais e duas chamadas", () => {
  const leg = "Seu post some porque a primeira linha não segura ninguém.\n\nComenta ROTEIRO que eu te mando o modelo. Link na bio também.\n#a #b #c #d #e #f";
  const r = F.estLegenda(leg);
  assert.equal(r.visivel.length, 125);
  assert.equal(r.veredito, "corrigir");
  assert.ok(r.checks.find(c => c.nome === "Hashtags" && c.status === "falha"));
  assert.ok(r.checks.find(c => c.nome === "Uma chamada" && c.status === "aviso"));
});

test("legenda boa sai pronta", () => {
  const r = F.estLegenda("3 erros que fazem o seu Reels morrer no primeiro segundo.\n\n1. Abrir com bom dia.\n2. Texto na tela pequeno demais.\n3. Prometer e entregar só no fim.\n\nSalva esse post pra revisar antes de gravar.\n#reelsdicas #marketingdigital");
  assert.equal(r.veredito, "pronta", JSON.stringify(r.checks));
});

test("legenda começando com hashtag falha", () => {
  assert.equal(F.estLegenda("#dica primeira linha").checks.find(c => c.nome === "Primeira linha").status, "falha");
});

test("limpar: tira invisível e travessão, mantém link e emoji composto", () => {
  const t = "Olha isso​ — funciona… “de verdade” https://site.com/a—b 👨‍💻";
  const r = F.estLimpar(t);
  assert.equal(r.texto, "Olha isso, funciona... \"de verdade\" https://site.com/a—b 👨‍💻");
  assert.ok(r.mudancas.length >= 4);
});

test("sinais: clichê, estrutura 'não é só' e ritmo igual", () => {
  const s = F.estSinais("No mundo de hoje, não é só postar, é estratégia. Isso muda tudo pra sua marca. Isso muda tudo pra sua venda. Isso muda tudo pra sua equipe. Isso muda tudo pra sua rotina.");
  const tipos = s.map(x => x.tipo);
  assert.ok(tipos.includes("Clichê"));
  assert.ok(tipos.some(t => /Não é só/.test(t)));
  assert.ok(tipos.includes("Ritmo"));
  assert.deepEqual(F.estSinais("Texto normal, escrito por gente."), []);
});

test("tempos: marca gancho, meio e chamada, alerta gancho longo e fecha o laço", () => {
  const rot = [
    "Eu perdi 18 clientes num mês por causa de uma mensagem que eu mandava todo santo dia sem perceber",
    "Era a mensagem de boas-vindas.",
    "Ela pedia três coisas de uma vez.",
    "Troquei por uma pergunta só.",
    "Comenta MENSAGEM que eu te mando o modelo que trouxe os clientes de volta.",
  ].join("\n");
  const r = F.estTempos(rot, 165, 15);
  assert.equal(r.trechos[0].papel, "Gancho");
  assert.equal(r.trechos[r.trechos.length - 1].papel, "Chamada");
  assert.ok(r.trechos.some(t => t.papel === "Meio"));
  assert.ok(r.trechos[0].alertas.length, "gancho passa de 3 s");
  assert.ok(r.notas.some(n => /Fecha o laço/.test(n)), r.notas.join("|"));
  assert.ok(r.notas.some(n => /alvo|Tamanho certo/.test(n)));
  assert.equal(F.estTempos("   "), null);
});
