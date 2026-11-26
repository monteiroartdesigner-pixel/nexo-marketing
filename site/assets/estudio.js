"use strict";
// ============================================================================
// ESTÚDIO · as skills de escrita do Instagram dentro do NEXO Marketing (fase 1).
// Cinco ferramentas rodam aqui mesmo, na hora e sem custo (assets/estudio-ferramentas.js):
// nota do gancho, as 26 fórmulas, revisão de legenda, limpeza do jeito de IA e tempo do roteiro.
// "Pedir à equipe" manda o pedido para a mesma fila do Pedir peça (nexo_pedir_ideias); a equipe
// escreve na próxima rodada e a peça chega em Aprovar. Nada vai ao ar sem o seu OK.
// Usa st, rpc, esc, aviso, msgErro, quando, podeEditar, abrirAba e mkMarcaSelect do painel.
// ============================================================================

const EST_ABAS = [
  ["gancho", "Nota do gancho"], ["formulas", "26 fórmulas"], ["legenda", "Legenda"],
  ["limpar", "Tirar o jeito de IA"], ["tempo", "Tempo do roteiro"], ["pedir", "Pedir à equipe"],
];
const EST_PEDIDOS = {
  reel: { nome: "Roteiro de Reels", prefixo: "[Estúdio · Roteiro de Reels: 3 ganchos de fórmulas diferentes com nota, roteiro falado, texto na tela e tempos]",
    texto: "Três ganchos de fórmulas diferentes, já com nota, o roteiro falado, o texto de cada tela e o tempo de cada trecho." },
  carrossel: { nome: "Carrossel", prefixo: "[Estúdio · Carrossel: capa que faz arrastar, 5 a 7 slides com uma ideia cada, último com a chamada]",
    texto: "Capa que faz arrastar, de 5 a 7 slides com uma ideia cada e a chamada no último." },
  story: { nome: "Sequência de Stories", prefixo: "[Estúdio · Sequência de Stories: 3 a 5 telas, a figurinha certa em cada uma e a conversa no direct]",
    texto: "De 3 a 5 telas para o dia, a figurinha certa em cada uma e a conversa que começa no direct." },
};
const EST_VEREDITO = { forte: ["Forte", "ok"], ok: ["Dá para usar", "info"], fraco: ["Fraco", "warn"] };
const EST_LEG_VER = { pronta: ["Pronta", "ok"], rever: ["Rever", "info"], corrigir: ["Corrigir", "warn"] };
const est = { aba: "gancho", ganchos: "", legenda: "", limpar: "", roteiro: "", ppm: 165, alvo: 30, tipo: "reel", busca: "" };
try { est.aba = localStorage.getItem("nexo.estudio") || "gancho"; } catch {}
if (!EST_ABAS.some(([k]) => k === est.aba)) est.aba = "gancho";

const estBarra = n => `<span class="es-barra" aria-hidden="true"><i style="width:${Math.max(2, n)}%" class="${n >= 70 ? "ok" : n >= 50 ? "info" : "warn"}"></i></span>`;
const estPill = ([rot, cls]) => `<span class="pill ${cls}">${esc(rot)}</span>`;
const estSeg = s => s.toFixed(1).replace(".", ",") + " s";

function estudio(el) {
  el.innerHTML = `<div class="es">
    <nav class="es-abas" aria-label="Ferramentas do Estúdio">${EST_ABAS.map(([k, t]) => `<button type="button" data-es="${k}" aria-pressed="${est.aba === k}">${esc(t)}</button>`).join("")}</nav>
    <div id="esCorpo"></div>
    <p class="muted peq es-credito">Ferramentas adaptadas do <a href="https://github.com/Jakeschincariol/instagram-agent-skill" target="_blank" rel="noopener">instagram-agent-skill</a> (Jake Schincariol, <a href="assets/LICENSE-instagram-agent-skill.txt" target="_blank">licença MIT</a>) para o português. As quatro primeiras rodam no seu navegador: nada é enviado.</p>
  </div>`;
  $$("[data-es]", el).forEach(b => b.onclick = () => { est.aba = b.dataset.es; try { localStorage.setItem("nexo.estudio", est.aba); } catch {} estudio(el); });
  ({ gancho: estGancho, formulas: estFormulas, legenda: estLegendaTela, limpar: estLimparTela, tempo: estTempoTela, pedir: estPedir })[est.aba]($("#esCorpo", el), el);
}

// ---------------------------------------------------------------- nota do gancho
function estGancho(c) {
  c.innerHTML = `<section class="card">
      <label class="campo">Seus ganchos, um por linha<textarea id="esGanchos" rows="5" placeholder="Ex.: Você perdeu R$ 18 mil por esquecer uma cláusula.&#10;Pare de postar três vezes por dia.">${esc(est.ganchos)}</textarea></label>
      <p class="muted peq" style="margin:0">A nota olha 5 coisas que os ganchos que seguram têm em comum: cabe em 2 segundos, tem algo concreto, tem algo em jogo, a palavra forte vem logo e fala com alguém. Ela pega gancho fraco; não diz qual de dois ganchos bons vai viralizar. Quem decide isso é o gráfico de retenção.</p>
    </section><div id="esNotas" class="es-lista"></div>`;
  const ta = $("#esGanchos", c), out = $("#esNotas", c);
  const desenhar = () => {
    est.ganchos = ta.value;
    const lista = estRankGanchos(ta.value);
    out.innerHTML = lista.length ? lista.map((r, i) => `<article class="card es-nota">
        <div class="linha entre" style="flex-wrap:nowrap;align-items:flex-start">
          <b class="es-frase">${lista.length > 1 && i === 0 ? "<span class=\"es-top\">Grave este</span> " : ""}“${esc(r.gancho)}”</b>
          <span class="linha" style="gap:8px;flex-wrap:nowrap"><span class="es-num">${r.nota}</span>${estPill(EST_VEREDITO[r.veredito])}</span></div>
        <div class="es-checks">${r.checks.map(k => `<div class="es-check${k.id === r.pior && r.veredito !== "forte" ? " pior" : ""}"><span>${esc(k.nome)}</span>${estBarra(k.nota)}<b>${k.nota}</b><small class="muted">${esc(k.detalhe)}</small></div>`).join("")}</div>
        ${r.alertas.map(a => `<div class="aviso peq">${esc(a)}</div>`).join("")}
        ${r.veredito !== "forte" ? `<p class="peq muted" style="margin:0">O ponto mais fraco é <b>${esc(r.checks.find(k => k.id === r.pior).nome.toLowerCase())}</b>. Arrume esse e veja a nota de novo.</p>` : ""}
      </article>`).join("") + (lista.length > 1 && lista[0].nota < 50 ? `<div class="aviso">O melhor ficou abaixo de 50. Nenhum desses é o gancho ainda.</div>` : "")
      : `<div class="vazio">Escreva um gancho acima. A nota aparece enquanto você digita.</div>`;
  };
  ta.oninput = desenhar; desenhar();
}

// ---------------------------------------------------------------- 26 fórmulas
function estFormulas(c, raiz) {
  c.innerHTML = `<section class="card">
      <h3 style="margin:0">Antes de escolher a fórmula</h3>
      <ol class="es-regras">${EST_REGRAS_GANCHO.map(r => `<li>${esc(r)}</li>`).join("")}</ol>
      <label class="campo">Procurar<input id="esBusca" type="search" placeholder="Ex.: preço, história, comparação" value="${esc(est.busca)}"></label>
    </section><div id="esForm" class="es-grade"></div>`;
  const busca = $("#esBusca", c), out = $("#esForm", c);
  const desenhar = () => {
    est.busca = busca.value;
    const q = estNorm(busca.value);
    const lista = EST_GANCHOS.filter(g => !q || estNorm([g.nome, g.modelo, g.exemplo, g.serve, g.armadilha].join(" ")).includes(q));
    out.innerHTML = lista.length ? lista.map(g => `<article class="card es-form">
        <div class="linha" style="gap:8px;flex-wrap:nowrap"><span class="es-id">${g.id}</span><h3 style="margin:0">${esc(g.nome)}</h3></div>
        <p class="es-modelo">${esc(g.modelo)}</p>
        <p class="peq" style="margin:0"><span class="muted">Exemplo:</span> ${esc(g.exemplo)}</p>
        <p class="peq" style="margin:0"><span class="muted">Na tela:</span> <span class="es-tela">${esc(g.tela)}</span></p>
        <p class="peq" style="margin:0"><span class="muted">Serve para:</span> ${esc(g.serve)}</p>
        <p class="peq" style="margin:0"><span class="muted">Onde dá errado:</span> ${esc(g.armadilha)}</p>
        <button type="button" class="btn peq" data-usar="${g.id}" style="align-self:flex-start">Usar este modelo</button>
      </article>`).join("") : `<div class="vazio">Nenhuma fórmula com essa palavra.</div>`;
    $$("[data-usar]", out).forEach(b => b.onclick = () => {
      const g = EST_GANCHOS.find(x => x.id === Number(b.dataset.usar));
      est.ganchos = (est.ganchos.trim() ? est.ganchos.trim() + "\n" : "") + g.modelo;
      est.aba = "gancho"; estudio(raiz);
      const ta = $("#esGanchos", raiz); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
      aviso("Modelo colado. Troque o que está entre chaves pelo seu caso.");
    });
  };
  busca.oninput = desenhar; desenhar();
}

// ---------------------------------------------------------------- legenda
function estLegendaTela(c) {
  let conta = "sua_conta"; try { conta = (st.ctx?.empresas?.[0]?.nome || "sua_conta").toLowerCase().replace(/[^a-z0-9._]+/g, "_").slice(0, 24) || "sua_conta"; } catch {}
  c.innerHTML = `<div class="es-duas">
      <section class="card"><label class="campo">Legenda<textarea id="esLeg" rows="10" placeholder="A primeira linha é o gancho. O feed corta perto dos 125 caracteres.">${esc(est.legenda)}</textarea></label>
        <p class="muted peq" style="margin:0" id="esLegConta"></p></section>
      <section class="es-feed" aria-label="Como aparece no feed"><div class="es-feed-cab"><span class="es-avatar" aria-hidden="true"></span><b>${esc(conta)}</b></div>
        <div class="es-feed-img" aria-hidden="true"></div><p class="es-feed-txt" id="esLegFeed"></p></section>
    </div><div id="esLegOut"></div>`;
  const ta = $("#esLeg", c);
  const desenhar = () => {
    est.legenda = ta.value;
    const r = estLegenda(ta.value);
    $("#esLegConta", c).textContent = `${[...ta.value.trim()].length} caracteres · ${r.hashtags.length} hashtag(s)`;
    $("#esLegFeed", c).innerHTML = ta.value.trim() ? `<b>${esc(conta)}</b> ${esc(r.visivel).replace(/\n/g, " ")}${r.cortada ? `<span class="muted">... mais</span>` : ""}` : `<span class="muted">A prévia aparece aqui.</span>`;
    $("#esLegOut", c).innerHTML = ta.value.trim() ? `<section class="card"><div class="linha entre"><h3 style="margin:0">Revisão</h3>${estPill(EST_LEG_VER[r.veredito])}</div>
      <ul class="es-itens">${r.checks.map(k => `<li><span class="pill ${k.status === "ok" ? "ok" : k.status === "falha" ? "warn" : "info"}">${k.status === "ok" ? "OK" : k.status === "falha" ? "Corrigir" : "Atenção"}</span><b>${esc(k.nome)}</b><span class="muted">${esc(k.detalhe)}</span></li>`).join("")}</ul></section>` : "";
  };
  ta.oninput = desenhar; desenhar();
}

// ---------------------------------------------------------------- jeito de IA
function estLimparTela(c) {
  c.innerHTML = `<section class="card"><label class="campo">Texto (legenda, roteiro, mensagem)<textarea id="esTxt" rows="8" placeholder="Cole aqui o texto escrito por IA ou por você.">${esc(est.limpar)}</textarea></label>
      <div class="linha"><button class="btn prim" type="button" id="esLimpar">Limpar e revisar</button><span class="muted peq">Tira caracteres invisíveis, travessão e aspas curvas. Os vícios de escrita só são apontados: a frase quem muda é você.</span></div></section>
    <div id="esTxtOut"></div>`;
  const ta = $("#esTxt", c);
  ta.oninput = () => { est.limpar = ta.value; };
  $("#esLimpar", c).onclick = () => {
    est.limpar = ta.value;
    if (!ta.value.trim()) { aviso("Cole um texto primeiro.", true); return; }
    const l = estLimpar(ta.value), s = estSinais(l.texto);
    $("#esTxtOut", c).innerHTML = `<section class="card"><div class="linha entre"><h3 style="margin:0">Texto limpo</h3><button class="btn peq" type="button" id="esCopiar">Copiar</button></div>
        <pre class="es-pre">${esc(l.texto)}</pre>
        <p class="muted peq" style="margin:0">${l.mudancas.length ? "Trocado: " + esc(l.mudancas.join(" · ")) + "." : "Nada para trocar."}</p></section>
      <section class="card"><div class="linha entre"><h3 style="margin:0">Jeito de IA</h3>${estPill(s.length ? [`${s.length} sinal(is)`, "warn"] : ["Nenhum sinal", "ok"])}</div>
        ${s.length ? `<ul class="es-itens">${s.map(x => `<li><b>${esc(x.tipo)}</b><span>“${esc(x.trecho)}”</span>${x.dica ? `<span class="muted">${esc(x.dica)}</span>` : ""}</li>`).join("")}</ul>` : `<p class="muted peq" style="margin:0">Não achei clichê, estrutura de roteiro nem frases todas do mesmo tamanho.</p>`}</section>`;
    $("#esCopiar", c).onclick = async () => { try { await navigator.clipboard.writeText(l.texto); aviso("Texto copiado."); } catch { aviso("Não deu para copiar. Selecione o texto e copie.", true); } };
  };
}

// ---------------------------------------------------------------- tempo do roteiro
function estTempoTela(c) {
  c.innerHTML = `<section class="card"><label class="campo">Roteiro, uma fala por linha<textarea id="esRot" rows="8" placeholder="Linha 1 é o gancho. A última é a chamada.">${esc(est.roteiro)}</textarea></label>
      <div class="linha"><label class="campo" style="flex:0 1 200px">Palavras por minuto<input id="esPpm" type="number" min="100" max="260" step="5" inputmode="numeric" value="${est.ppm}"></label>
        <label class="campo" style="flex:0 1 200px">Tamanho alvo<select id="esAlvo">${[0, 15, 30, 45, 60, 90].map(v => `<option value="${v}" ${est.alvo === v ? "selected" : ""}>${v ? v + " segundos" : "Sem alvo"}</option>`).join("")}</select></label></div>
      <p class="muted peq" style="margin:0">A maioria das pessoas fala entre 150 e 200 palavras por minuto. Cronometre você lendo um roteiro e ajuste. Os tempos são estimativa para planejar a edição, não substituem gravar.</p></section>
    <div id="esRotOut"></div>`;
  const ta = $("#esRot", c), ppm = $("#esPpm", c), alvo = $("#esAlvo", c);
  const desenhar = () => {
    est.roteiro = ta.value; est.ppm = Math.min(260, Math.max(100, Number(ppm.value) || 165)); est.alvo = Number(alvo.value) || 0;
    const r = estTempos(ta.value, est.ppm, est.alvo || null);
    $("#esRotOut", c).innerHTML = r ? `<section class="card"><div class="linha entre"><h3 style="margin:0">${r.palavras} palavras · uns ${estSeg(r.total)}</h3><span class="muted peq">${r.ppm} palavras por minuto</span></div>
        <div class="es-tabela" role="table" aria-label="Tempos do roteiro"><div role="row" class="es-tr es-th"><span role="columnheader">Início</span><span role="columnheader">Dura</span><span role="columnheader">Papel</span><span role="columnheader">Fala</span></div>
        ${r.trechos.map(t => `<div role="row" class="es-tr${t.alertas.length ? " alerta" : ""}"><span role="cell" class="es-mono">${t.tc}</span><span role="cell" class="es-mono">${estSeg(t.dur)}</span><span role="cell">${t.papel ? `<span class="pill info">${esc(t.papel)}</span>` : ""}</span><span role="cell">${esc(t.texto)}${t.alertas.map(a => `<small class="es-alerta">${esc(a)}</small>`).join("")}</span></div>`).join("")}</div></section>
      <section class="card"><h3 style="margin:0">O que ajustar</h3><ul class="es-itens">${r.notas.map(n => `<li><span>${esc(n)}</span></li>`).join("")}</ul></section>` : `<div class="vazio">Cole o roteiro acima. Cada linha vira um trecho com o tempo dele.</div>`;
  };
  ta.oninput = desenhar; ppm.oninput = desenhar; alvo.onchange = desenhar; desenhar();
}

// ---------------------------------------------------------------- pedir à equipe
async function estPedir(c) {
  const pode = podeEditar(), p = EST_PEDIDOS[est.tipo], max = 500 - p.prefixo.length - 1;
  c.innerHTML = `<section class="card">
      <div class="es-tipos" role="group" aria-label="O que a equipe vai escrever">${Object.entries(EST_PEDIDOS).map(([k, v]) => `<button type="button" data-tipo="${k}" aria-pressed="${est.tipo === k}" ${pode ? "" : "disabled"}><b>${esc(v.nome)}</b><span>${esc(v.texto)}</span></button>`).join("")}</div>
      <label class="campo">Sobre o quê?<textarea id="esTema" maxlength="${max}" rows="3" placeholder="Ex.: por que o dono de arena perde horário vago · bastidor do NEXO Prospect achando cliente" ${pode ? "" : "disabled"}></textarea></label>
      <div class="linha entre">${typeof mkMarcaSelect === "function" ? mkMarcaSelect(pode) : ""}<button class="btn prim" id="esEnviar" ${pode ? "" : "disabled"}>Pedir ${esc(p.nome.toLowerCase())}</button></div>
      <p class="muted peq" style="margin:0">Vai para a fila do <b>Pedir peça</b>. A equipe escreve na próxima rodada, usa a voz da marca e as fórmulas, e o resultado chega em <b>Aprovar</b>. Nada vai ao ar sem o seu OK.</p>
    </section><section class="stack-id" id="esFila"><div class="vazio">Carregando os pedidos do Estúdio…</div></section>`;
  $$("[data-tipo]", c).forEach(b => b.onclick = () => { est.tipo = b.dataset.tipo; estPedir(c); });
  const btn = $("#esEnviar", c);
  if (btn) btn.onclick = async () => {
    const tema = $("#esTema", c).value.trim();
    if (tema.length < 8) { aviso("Diga o tema em pelo menos uma frase curta.", true); return; }
    btn.disabled = true;
    try {
      const r = await rpc("nexo_pedir_ideias", { p_agente: st.agente, p_texto: `${p.prefixo} ${tema}`.slice(0, 500), p_quantidade: 1 });
      const marca = $("#idMarca", c)?.value || "";
      if (marca && typeof mkMarcarPedido === "function") await mkMarcarPedido(r?.id, marca);
      aviso(`Pedido de ${p.nome.toLowerCase()} enviado à equipe.`); estPedir(c);
    } catch (e) { btn.disabled = false; aviso(msgErro(e).replace(/^.*pedido_invalido:\s*/, ""), true); }
  };
  let lista = [];
  try { lista = (await rpc("nexo_ideias", { p_agente: st.agente }) || []).filter(x => (x.texto || "").startsWith("[Estúdio")); }
  catch (e) { $("#esFila", c).innerHTML = `<div class="vazio">${esc(msgErro(e))}</div>`; return; }
  const fila = $("#esFila", c); if (!fila) return;
  fila.innerHTML = `<h2 style="margin:0">Pedidos do Estúdio</h2>` + (lista.length ? lista.map(x => {
    const [rot, cls] = (typeof ID_ST !== "undefined" && ID_ST[x.status]) || [x.status, "muted"];
    const tipo = (x.texto.match(/^\[Estúdio · ([^:\]]+)/) || [])[1] || "Pedido", tema = x.texto.replace(/^\[[^\]]*\]\s*/, "");
    return `<article class="card id-pedido"><div class="linha entre" style="flex-wrap:nowrap;align-items:flex-start">
        <div style="min-width:0"><b>${esc(tipo)}</b><div class="peq">${esc(tema)}</div><div class="muted peq">pedido ${esc(quando(x.criado_em))}</div></div>
        <span class="pill ${cls}">${esc(rot)}</span></div>
        ${x.status === "sem_resultado" && x.observacao ? `<div class="aviso peq">${esc(x.observacao)}</div>` : ""}
        ${(x.pecas || []).length ? `<button class="btn peq" type="button" data-ir-aprovar style="align-self:flex-start">Ver em Aprovar (${x.pecas.length})</button>` : ""}</article>`;
  }).join("") : `<div class="vazio">Nenhum pedido feito pelo Estúdio ainda.</div>`);
  $$("[data-ir-aprovar]", fila).forEach(b => b.onclick = () => abrirAba("aprovar"));
}
