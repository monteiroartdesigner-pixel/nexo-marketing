"use strict";
// ============================================================================
// Ferramentas do Estúdio que rodam no navegador, sem rede e sem IA:
//   estNotaGancho  · nota do gancho em 5 propriedades (hookscore.py)
//   estLegenda     · o que o feed mostra antes do "... mais" e as regras (caption.py)
//   estLimpar      · tira invisíveis, travessão e aspas curvas (humanize.py)
//   estSinais      · aponta clichês e estruturas de texto de IA (detect.py)
//   estTempos      · roteiro de Reels em tempos (beats.py)
// Adaptado do instagram-agent-skill (Jake Schincariol, licença MIT,
// assets/LICENSE-instagram-agent-skill.txt) para o português do Brasil, a partir das
// versões que o agente do @nexo.rm já usa (agente/humanizar.py e agente/legenda.py).
// A nota é um filtro de ganchos fracos, não uma previsão de views: o original acerta
// gancho bom contra gancho ruim (AUC 0,83), mas não diz qual de dois ganchos bons viraliza.
// ============================================================================

// "R$ 18.000" falado é uma palavra só; aqui também.
const EST_RE_PALAVRA = /[\p{L}\p{N}$%'’-]+/gu;
const estPalavras = t => (String(t || "").replace(/(?<=\d)[.,](?=\d{3}\b)/g, "").match(EST_RE_PALAVRA) || []);
const estSemAcento = t => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "");
const estNorm = t => estSemAcento(t).toLowerCase().replace(/\s+/g, " ").trim();
const estLimpa = w => estNorm(w).replace(/^['’-]+|['’-]+$/g, "");
const estLimite = n => Math.max(0, Math.min(100, n));
const estMedia = a => a.reduce((s, x) => s + x, 0) / (a.length || 1);

// Números ditos em voz alta são tão concretos quanto os escritos ("vinte mil", "R$ 20.000").
const EST_NUMEROS_FALADOS = new Set(["zero", "dois", "duas", "tres", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez",
  "onze", "doze", "quinze", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa", "cem",
  "cento", "duzentos", "trezentos", "quinhentos", "mil", "milhao", "milhoes", "bilhao", "duzia", "metade", "dobro", "triplo"]);
const EST_DINHEIRO = new Set(["reais", "real", "conto", "contos", "pila", "porcento", "centavos", "milionario", "faturamento",
  "faturei", "faturou", "lucro", "salario", "aluguel", "prejuizo"]);
// Palavras que colocam algo em jogo. Sem nenhuma, o gancho é só uma afirmação.
const EST_TENSAO = new Set(["pare", "para", "parei", "nunca", "errado", "errada", "erro", "erros", "errando", "perdi", "perder",
  "perdendo", "perdeu", "custou", "custa", "custo", "quebrei", "quebrou", "falhou", "falha", "fracasso", "ninguem", "nao", "nem",
  "sem", "larguei", "largar", "demitido", "apaguei", "apagar", "apague", "matou", "mata", "substituiu", "substitui", "cortei",
  "cortar", "venceu", "gratis", "pago", "paguei", "cobrou", "cobrar", "contratei", "economizei", "primeiro", "primeira", "proibido",
  "ilegal", "pior", "odeio", "odiei", "desperdicei", "desperdicio", "golpe", "mentira", "mentiu", "verdade", "segredo", "escondido",
  "escondem", "roubou", "roubado", "antes", "ate", "mas", "exceto", "problema", "risco", "perigo", "cuidado", "alerta",
  "arrependo", "arrependimento", "deveria", "ainda", "ja", "so", "apenas", "contra", "versus", "vs", "flop", "floparam", "flopar"]);
// Aberturas que gastam o primeiro segundo sem dizer nada.
const EST_ABERTURAS_FRACAS = ["entao", "ok", "oi", "ola", "e ai", "eai", "galera", "pessoal", "gente", "bem vindo", "bem-vindo",
  "hoje", "basicamente", "sinceramente", "olha so", "escuta", "hum", "deixa eu", "eu queria", "eu quero", "eu vou", "um dos",
  "uma das", "voce ja", "voces", "neste", "nesse", "no video", "a coisa", "tem muita", "isso e", "isto e", "como um", "como uma",
  "sabe quando", "voce sabe"];
// Ordens que merecem abrir a frase.
const EST_IMPERATIVOS = new Set(["pare", "para", "copia", "copie", "rouba", "roube", "apaga", "apague", "testa", "teste", "tente",
  "assista", "veja", "olha", "leia", "salva", "salve", "usa", "use", "monta", "monte", "faz", "faca", "escreva", "manda", "mande",
  "pega", "pegue", "comeca", "comece", "larga", "largue", "nunca", "sempre", "nao", "coloca", "coloque", "confira", "confere"]);
const EST_RE_NUMERO = /R\$\s?\d[\d.]*(?:,\d+)?|\d[\d.,]*\s?(?:%|mil\b|mi\b|k\b|x\b|h\b|horas?\b|min\b|minutos?\b|dias?\b|semanas?\b|meses\b|m[eê]s\b|anos?\b)?/giu;
const EST_RE_NOME = /(?<=\S\s+)\p{Lu}\p{Ll}{2,}/gu;   // nome próprio fora do começo da frase
const EST_RE_HASHTAG = /(?:^|\s)#[\p{L}\p{N}_]+/u;
const EST_RE_EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const EST_ELIMINATORIOS = [
  [/^\s*(?:pare de rolar|para de rolar|n[aã]o passa|n[aã]o pula)/iu, "Abre com \"pare de rolar\". Pedir atenção prova que você ainda não ganhou."],
  [/(?:^|\s)(?:n(?:este|esse) (?:v[ií]deo|reels?)|no (?:v[ií]deo|reels?) de hoje|vou te mostrar|vou mostrar pra voc[eê]s|hoje eu vou)(?=\s|$|[.,!?])/iu, "Preparação de vídeo. Apague e abra direto na recompensa."],
  [/^\s*(?:oi|ol[aá]|e a[ií]|fala,? galera|bem[ -]vindos?)(?=\s|[,!.])/iu, "Cumprimento. Ninguém foi ao feed para ser cumprimentado."],
  [EST_RE_HASHTAG, "Hashtag no gancho. Hashtag vai no fim da legenda, se for."],
  [EST_RE_EMOJI, "Emoji no gancho. No texto grande da tela cabe palavra ou emoji, não os dois."],
];
const EST_CHECKS = [["tamanho", "Tamanho"], ["concreto", "Concreto"], ["tensao", "Algo em jogo"], ["inicio", "Logo de cara"], ["publico", "Fala com alguém"]];

function estChecaTamanho(t) {
  const n = estPalavras(t).length, seg = n / 2.75, chars = t.trim().length;
  let nota = n >= 5 && n <= 12 ? 100 : n < 5 ? 100 - (5 - n) * 20 : 100 - (n - 12) * 11;
  if (chars > 60) nota -= 12;   // duas linhas de texto grande na tela
  return [estLimite(nota), `${n} palavras, ${chars} caracteres, uns ${seg.toFixed(1).replace(".", ",")} s falando (o ideal é de 5 a 12 palavras)`];
}
function estChecaConcreto(t) {
  const nums = (t.match(EST_RE_NUMERO) || []).map(x => x.trim()).filter(Boolean);
  const nomes = [...new Set(t.match(EST_RE_NOME) || [])];
  const falados = estPalavras(t).map(estLimpa).filter(w => EST_NUMEROS_FALADOS.has(w) || EST_DINHEIRO.has(w));
  const n = nums.length + nomes.length + falados.length;
  const achou = [...nums.slice(0, 2), ...nomes.slice(0, 2), ...falados.slice(0, 2)].join(", ");
  return [n ? estLimite(45 + n * 30) : 15, n ? `${n} detalhe(s) concreto(s): ${achou}` : "nenhum número, nenhum nome, nada que dê para conferir"];
}
function estChecaTensao(t) {
  const marcas = [...new Set(estPalavras(t).map(estLimpa).filter(w => EST_TENSAO.has(w)))].sort();
  if (/R\$\s?\d/.test(t)) marcas.push("um preço");
  const nota = marcas.length === 0 ? 20 : marcas.length === 1 ? 70 : 100;
  return [nota, marcas.length ? `${marcas.length} sinal(is) de tensão: ${marcas.slice(0, 4).join(", ")}` : "nada está em jogo nesta frase"];
}
function estChecaInicio(t) {
  const w = estPalavras(t); if (!w.length) return [0, "vazio"];
  const low = w.map(estLimpa), abertura = low.slice(0, 2).join(" ");
  const fraca = EST_ABERTURAS_FRACAS.find(f => abertura.startsWith(f) || low[0] === f);
  let carga = -1;
  for (let i = 0; i < low.length; i++) {
    if (EST_TENSAO.has(low[i]) || EST_NUMEROS_FALADOS.has(low[i]) || EST_DINHEIRO.has(low[i]) || /^(?:R\$)?\d/.test(w[i]) || (i && /^\p{Lu}\p{Ll}{2,}$/u.test(w[i]))) { carga = i; break; }
  }
  const [base, onde] = carga < 0 ? [30, "nenhuma palavra forte na frase"] : carga <= 3 ? [100, `palavra forte na ${carga + 1}ª posição`]
    : carga <= 6 ? [70, `palavra forte na ${carga + 1}ª posição, dá para trazer para frente`] : [40, `palavra forte na ${carga + 1}ª posição, tarde demais`];
  return [estLimite(base - (fraca ? 30 : 0)), onde + (fraca ? `; abertura fraca "${fraca}"` : "")];
}
function estChecaPublico(t) {
  const low = estPalavras(t).map(estLimpa);
  if (low.some(w => ["voce", "voces", "vc", "seu", "sua", "seus", "suas", "te", "tu", "teu", "tua"].includes(w))) return [100, "fala com quem está assistindo"];
  if (low.length && EST_IMPERATIVOS.has(low[0])) return [90, `abre com uma ordem ("${low[0]}")`];
  if (low.some(w => ["eu", "meu", "minha", "meus", "minhas", "me", "nos", "nosso", "nossa", "comigo"].includes(w)) || /\ba gente\b/.test(estNorm(t))) return [70, "primeira pessoa, sem falar com ninguém"];
  return [35, "terceira pessoa, ninguém na sala"];
}

function estNotaGancho(texto) {
  const t = String(texto || "").trim();
  const checks = { tamanho: estChecaTamanho(t), concreto: estChecaConcreto(t), tensao: estChecaTensao(t), inicio: estChecaInicio(t), publico: estChecaPublico(t) };
  const notas = EST_CHECKS.map(([k]) => checks[k][0]);
  const alertas = EST_ELIMINATORIOS.filter(([re]) => re.test(t)).map(([, msg]) => msg);
  // A propriedade mais fraca segura o gancho: uma só já basta para o dedo continuar rolando.
  const nota = Math.round(estLimite(estMedia(notas) * 0.6 + Math.min(...notas) * 0.4 - alertas.length * 15));
  const veredito = nota >= 70 && Math.min(...notas) >= 55 && !alertas.length ? "forte" : nota >= 50 ? "ok" : "fraco";
  const pior = EST_CHECKS.reduce((a, b) => checks[b[0]][0] < checks[a[0]][0] ? b : a)[0];
  return { gancho: t, nota, veredito, pior, alertas,
    checks: EST_CHECKS.map(([k, nome]) => ({ id: k, nome, nota: Math.round(checks[k][0]), detalhe: checks[k][1] })) };
}
// Várias linhas: nota de cada uma, da melhor para a pior.
const estRankGanchos = texto => String(texto || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(estNotaGancho).sort((a, b) => b.nota - a.nota);

// ---------------------------------------------------------------- legenda
const EST_LEG_LIMITE = 2200, EST_LEG_CORTE = 125, EST_LEG_MAX_TAGS = 5;
const EST_RE_TAGS = /(?:^|\s)(#[\p{L}\p{N}_]+)/gu;
const EST_RE_LINK = /https?:\/\/\S+|\bwww\.\S+|\b[a-z0-9-]+\.(?:com|com\.br|br|me|io|net|org|app)\/\S*/giu;
const EST_CHAMADAS = [
  [/[Cc]oment[ae]r? (?:a palavra )?"?\p{Lu}{3,}(?!\p{L})/u, "comentar palavra-chave"],   // a palavra-chave é em maiúsculas
  [/(?:me chama|chama|manda mensagem|fala comigo|fala com a gente) (?:no |pelo |na )?(?:direct|dm|whats|zap|whatsapp)/iu, "chamar na mensagem"],
  [/link na bio/iu, "link na bio"],
  [/salv[ae] (?:esse|este|o post|pra|para)/iu, "salvar"],
  [/(?:manda|envia|compartilha) (?:pro|pra|para|esse|isso|este)/iu, "compartilhar"],
  [/marca (?:aqui|aquele|aquela|um amigo|uma amiga|o amigo|a amiga|quem|o seu|a sua|seu|sua|teu|tua)/iu, "marcar alguém"],
  [/segue (?:o|a) @|siga (?:o|a) @/iu, "seguir"],
];
const EST_TAGS_GENERICAS = new Set(["#viral", "#fyp", "#explore", "#explorar", "#reels", "#reelsinstagram", "#instagood", "#trending",
  "#foryou", "#paravoce", "#like4like", "#follow", "#seguidores"]);

function estLegenda(legenda) {
  const texto = String(legenda || "").trim(), primeira = texto ? texto.split("\n")[0].trim() : "";
  const janela = [...texto].slice(0, EST_LEG_CORTE).join("");
  const tags = [...texto.matchAll(EST_RE_TAGS)].map(m => m[1]), links = texto.match(EST_RE_LINK) || [];
  let chamadas = new Set(EST_CHAMADAS.filter(([re]) => re.test(texto)).map(([, n]) => n));
  if (chamadas.has("chamar na mensagem") && chamadas.has("link na bio")) { chamadas.delete("chamar na mensagem"); chamadas.delete("link na bio"); chamadas.add("chamar pelo link da bio"); }
  chamadas = [...chamadas].sort();
  const emojis = texto.match(new RegExp(EST_RE_EMOJI.source, "gu")) || [];
  const checks = [], add = (nome, status, detalhe) => checks.push({ nome, status, detalhe });
  add("Tamanho", texto.length > EST_LEG_LIMITE ? "falha" : "ok", `${texto.length} de ${EST_LEG_LIMITE} caracteres`);
  if (!primeira) add("Primeira linha", "falha", "legenda vazia ou começando com linha em branco");
  else if (/^[#@]/.test(primeira)) add("Primeira linha", "falha", "começa com hashtag ou menção: a primeira linha é o gancho");
  else if (primeira.length > EST_LEG_CORTE) add("Primeira linha", "aviso", `${primeira.length} caracteres: o feed corta no meio da frase`);
  else add("Primeira linha", "ok", `${primeira.length} caracteres, aparece inteira`);
  const genericas = tags.filter(t => EST_TAGS_GENERICAS.has(t.toLowerCase()));
  if (tags.length > EST_LEG_MAX_TAGS) add("Hashtags", "falha", `${tags.length} hashtags; o teto é ${EST_LEG_MAX_TAGS}`);
  else if (genericas.length) add("Hashtags", "aviso", `hashtag genérica não descreve nada: ${genericas.join(" ")}`);
  else add("Hashtags", "ok", `${tags.length} hashtag(s)`);
  if (tags.some(t => janela.includes(t))) add("Hashtag no topo", "aviso", `tem hashtag nos primeiros ${EST_LEG_CORTE} caracteres, gastando o espaço do gancho`);
  if (links.length) add("Link", "aviso", "link na legenda não é clicável: use \"link na bio\" ou uma palavra-chave");
  if (chamadas.length === 1) add("Uma chamada", "ok", chamadas[0]);
  else if (!chamadas.length) add("Uma chamada", "aviso", "sem chamada: decida o que o post pede");
  else add("Uma chamada", "aviso", `${chamadas.length} chamadas (${chamadas.join(", ")}): duas valem o mesmo que nenhuma`);
  const dens = emojis.length * 100 / Math.max(texto.length, 1);
  if (dens > 4) add("Emoji", "aviso", `${emojis.length} emojis, ${dens.toFixed(1).replace(".", ",")} a cada 100 caracteres`);
  const falhas = checks.filter(c => c.status === "falha").length, avisos = checks.filter(c => c.status === "aviso").length;
  return { visivel: janela, cortada: [...texto].length > EST_LEG_CORTE, hashtags: tags, chamadas, checks,
    veredito: falhas ? "corrigir" : avisos ? "rever" : "pronta" };
}

// ---------------------------------------------------------------- jeito de IA
const EST_INVISIVEIS = /[​‌⁠﻿­᠎؜‎‏⁣]|\u{E0000}|[\u{E0001}-\u{E007F}]/gu;
const EST_ESPACOS = /[      ]/g;
const EST_CLICHES = ["no mundo de hoje", "nos dias de hoje", "no mundo atual", "nos dias atuais", "em um mundo cada vez mais",
  "na era digital", "mais do que nunca", "e importante ressaltar", "vale ressaltar", "vale destacar", "nao e segredo que",
  "sem mais delongas", "em suma", "em resumo", "por ultimo mas nao menos importante", "neste post", "neste video",
  "no video de hoje", "fique ate o final", "pare de rolar", "para de rolar", "siga para mais", "segue para mais",
  "deixa seu like", "curte e compartilha", "alavancar", "potencializar", "revolucionar", "revolucionario", "transformador",
  "sua jornada", "nessa jornada", "desbloquear", "destravar seu potencial", "elevar o nivel", "proximo nivel", "game changer",
  "solucao inovadora", "de forma eficiente", "sinergia", "ecossistema", "mergulhar fundo", "descubra como", "imagine so",
  "a verdade e que", "spoiler", "plot twist"];
const EST_ESTRUTURAS = [
  { re: /\bnao e (?:so|apenas|somente) [^.!?\n]{2,60}[,.]\s*e\b/, nome: "\"Não é só X, é Y\"", dica: "Diga a única coisa que importa. Corte a metade de preparação." },
  { re: /\bnao (?:so|apenas|somente)\b[^.!?\n]{2,80}\bmas (?:tambem|sim)\b/, nome: "\"Não apenas... mas também\"", dica: "Escolha um dos dois lados." },
  { re: /\b(?:o resultado|sabe o que (?:acontece|aconteceu)|adivinha)\?/, nome: "Pergunta-virada (\"O resultado?\")", dica: "Conte direto, sem suspense de roteiro." },
  { re: /\b(?:comente sim|digite \d|marque \d+ amigos|curte se)\b/, nome: "Isca de engajamento", dica: "Peça uma ação útil: comentar uma palavra-chave, marcar quem precisa ver." },
  { re: /(?:\b[A-ZÀ-Ý]{3,}\b[ ,!]+){3,}/u, nome: "Três palavras em CAIXA ALTA seguidas", dica: "Destaque uma palavra só.", original: true },
];

function estLimpar(texto) {
  if (!texto) return { texto: texto || "", mudancas: [] };
  const mud = [], links = [];
  let t = String(texto).replace(/https?:\/\/\S+|www\.\S+/g, m => { links.push(m); return `\u0000L${links.length - 1}\u0000`; });
  const troca = (re, por, rot) => { const n = (t.match(re) || []).length; if (n) { t = t.replace(re, por); mud.push(`${n} ${rot}`); } };
  troca(EST_INVISIVEIS, "", "caractere(s) invisível(is)");
  troca(EST_ESPACOS, " ", "espaço(s) estranho(s)");
  troca(/\s*—\s*/g, ", ", "travessão(ões) longo(s)");
  const meio = (t.match(/–/g) || []).length;
  if (meio) { t = t.replace(/\s*–\s*(?=\d)/g, "-").replace(/\s+–\s+/g, ", ").replace(/–/g, "-"); mud.push(`${meio} travessão(ões) curto(s)`); }
  troca(/[‘’]/g, "'", "aspa(s) simples curva(s)");
  troca(/[“”]/g, "\"", "aspa(s) curva(s)");
  troca(/…/g, "...", "reticência(s) de um caractere");
  t = t.replace(/,\s*([,.;:!?])/g, "$1").replace(/([.!?:;])[ \t]*,[ \t]*/g, "$1 ").replace(/,\s*\n/g, "\n").replace(/^\s*,\s*/gm, "");
  links.forEach((l, i) => { t = t.replace(`\u0000L${i}\u0000`, l); });
  return { texto: t, mudancas: mud };
}

function estSinais(texto) {
  const t = String(texto || ""); if (!t.trim()) return [];
  const norm = estNorm(t), achados = [];
  for (const c of EST_CLICHES) if (new RegExp(`(?<![a-z0-9])${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z0-9])`).test(norm)) achados.push({ tipo: "Clichê", trecho: c });
  for (const e of EST_ESTRUTURAS) { const m = (e.original ? t : norm).match(e.re); if (m) achados.push({ tipo: e.nome, trecho: m[0].slice(0, 60), dica: e.dica }); }
  const frases = t.split(/[.!?\n]+/).filter(f => f.trim().split(/\s+/).length >= 3);
  if (frases.length >= 5) {
    const tam = frases.map(f => f.trim().split(/\s+/).length), m = estMedia(tam);
    if (Math.sqrt(estMedia(tam.map(x => (x - m) ** 2))) < 2.5) achados.push({ tipo: "Ritmo", trecho: `${frases.length} frases quase do mesmo tamanho`, dica: "Misture frases curtas e longas." });
  }
  const comEmoji = t.split("\n").map(l => l.trim()).filter(l => l && /^\p{Extended_Pictographic}/u.test(l));
  if (comEmoji.length >= 3) achados.push({ tipo: "Lista de emojis", trecho: `${comEmoji.length} linhas começando com emoji`, dica: "Use no máximo um emoji de marcação." });
  return achados;
}

// ---------------------------------------------------------------- tempos do roteiro
const EST_JANELA_GANCHO = 3, EST_MAX_TRECHO = 4, EST_SEQ_ABSTRATA = 3, EST_REELS_MIN = 20, EST_REELS_MAX = 45;
const EST_RE_CONCRETO = /R\$\s?\d|\d[\d.,]*|(?<=\S\s+)\p{Lu}\p{Ll}{2,}/gu;
const EST_VAZIAS = new Set(["o", "a", "os", "as", "um", "uma", "e", "ou", "mas", "se", "de", "do", "da", "dos", "das", "em", "no",
  "na", "nos", "nas", "por", "pra", "para", "com", "que", "isso", "isto", "esse", "essa", "este", "esta", "e", "foi", "ser", "sao",
  "voce", "seu", "sua", "eu", "meu", "minha", "me", "a gente", "nos", "eles", "ele", "ela", "so", "ja", "nao", "sim", "tem", "ter",
  "vai", "vou", "faz", "fazer", "mais", "muito", "um", "todo", "toda", "tudo", "aqui", "ai", "la"]);
const estTc = s => { const m = Math.floor(s / 60); return `${m}:${(s - m * 60).toFixed(1).padStart(4, "0").replace(".", ",")}`; };

function estDividir(texto, pps) {
  const trechos = [];
  for (const linha of String(texto || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean)) {
    if (estPalavras(linha).length / pps <= EST_MAX_TRECHO * 1.5) { trechos.push(linha); continue; }
    let buf = "";   // parágrafo longo: quebra no fim das frases para os tempos fazerem sentido
    for (const parte of (linha.match(/[^.!?]+[.!?]*/g) || []).map(p => p.trim()).filter(Boolean)) {
      const cand = (buf + " " + parte).trim();
      if (buf && estPalavras(cand).length / pps > EST_MAX_TRECHO) { trechos.push(buf); buf = parte; } else buf = cand;
    }
    if (buf) trechos.push(buf);
  }
  return trechos;
}

function estTempos(roteiro, ppm = 165, alvo = null) {
  const pps = ppm / 60, trechos = estDividir(roteiro, pps);
  if (!trechos.length) return null;
  let relogio = 0;
  const linhas = trechos.map((texto, i) => {
    const n = estPalavras(texto).length, dur = n / pps;
    const r = { n: i + 1, inicio: relogio, dur, palavras: n, texto, concreto: (texto.match(EST_RE_CONCRETO) || []).length, papel: "", alertas: [] };
    relogio += dur; return r;
  });
  const total = relogio, notas = [];
  for (const r of linhas) if (r.n === 1 || r.inicio + r.dur <= EST_JANELA_GANCHO) r.papel = "Gancho";
  const ult = linhas[linhas.length - 1]; ult.papel = ult.papel ? "Gancho e chamada" : "Chamada";
  for (const r of linhas) if (!r.papel && r.inicio <= total / 2 && total / 2 < r.inicio + r.dur) r.papel = "Meio";
  const g = linhas[0];
  if (g.dur > EST_JANELA_GANCHO) { g.alertas.push(`gancho de ${g.dur.toFixed(1).replace(".", ",")} s, passa dos ${EST_JANELA_GANCHO} s`);
    notas.push(`O trecho 1 leva ${g.dur.toFixed(1).replace(".", ",")} s. Corte para até ${Math.floor(EST_JANELA_GANCHO * pps)} palavras, ou o gancho chega depois que a pessoa já decidiu.`); }
  if (!g.concreto) notas.push("O trecho 1 não tem número nem nome. Gancho sem nada para conferir é o que mais se pula.");
  for (const r of linhas) if (r.dur > EST_MAX_TRECHO) r.alertas.push(`${r.dur.toFixed(1).replace(".", ",")} s numa ideia só`);
  const longos = linhas.filter(r => r.dur > EST_MAX_TRECHO).map(r => r.n);
  if (longos.length) notas.push(`Trecho(s) ${longos.join(", ")} passam de ${EST_MAX_TRECHO} s. Divida a frase ou mude o que aparece na tela no meio dela: imagem parada é onde a pessoa sai.`);
  let seq = 0, ini = null;
  for (const r of linhas) {
    if (!r.concreto) { seq++; ini = ini ?? r.n; if (seq === EST_SEQ_ABSTRATA) notas.push(`Os trechos ${ini} a ${r.n} não têm nada concreto. Ponha um número, um nome ou um preço em um deles.`); }
    else { seq = 0; ini = null; }
  }
  const chave = t => new Set(estPalavras(t).map(estLimpa).filter(w => w && !EST_VAZIAS.has(w)));
  const a = chave(g.texto), laco = [...chave(ult.texto)].filter(w => a.has(w)).sort();
  notas.push(laco.length ? `Fecha o laço: o último trecho repete "${laco.slice(0, 3).join(", ")}" do gancho. Quem assiste de novo é alcance de graça.`
    : "Sem laço. O último trecho não repete nenhuma palavra do gancho, então o vídeo termina seco. Repetir uma palavra do trecho 1 é o jeito mais barato de ganhar uma segunda vista.");
  if (alvo) {
    const d = total - alvo;
    notas.push(Math.abs(d) <= alvo * 0.1 ? `Tamanho certo (${total.toFixed(1).replace(".", ",")} s para ${alvo} s).`
      : d > 0 ? `${d.toFixed(1).replace(".", ",")} s acima do alvo. Corte umas ${Math.floor(d * pps)} palavras.`
      : `${(-d).toFixed(1).replace(".", ",")} s abaixo do alvo. Acrescente umas ${Math.floor(-d * pps)} palavras ou grave curto mesmo. Curto costuma ser o certo.`);
  }
  // Regra de vídeo do Estúdio NEXO (regras/VIDEO.md): Reels de 20 a 45 s; tutorial de sistema, cerca de 90 s.
  if (total < EST_REELS_MIN) notas.push(`Fica com ${total.toFixed(1).replace(".", ",")} s. A regra de vídeo do Estúdio NEXO pede Reels de ${EST_REELS_MIN} a ${EST_REELS_MAX} s: acrescente umas ${Math.ceil((EST_REELS_MIN - total) * pps)} palavras.`);
  else if (total > EST_REELS_MAX) notas.push(`Passa de ${EST_REELS_MAX} s (${total.toFixed(1).replace(".", ",")} s). A regra de vídeo do Estúdio NEXO pede Reels de ${EST_REELS_MIN} a ${EST_REELS_MAX} s: corte umas ${Math.ceil((total - EST_REELS_MAX) * pps)} palavras. Tutorial de sistema pode ir até uns 90 s.`);
  return { ppm, alvo, total, palavras: linhas.reduce((s, r) => s + r.palavras, 0), trechos: linhas.map(r => ({ ...r, tc: estTc(r.inicio) })), notas };
}

if (typeof module !== "undefined") module.exports = { estNotaGancho, estRankGanchos, estLegenda, estLimpar, estSinais, estTempos, estPalavras };
