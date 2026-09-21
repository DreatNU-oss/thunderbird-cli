#!/usr/bin/env node

/**
 * Testes da listagem de pasta na extensão (acréscimo pessoal).
 *
 * As outras suítes simulam a ponte e nunca executam o código da extensão.
 * Esta carrega extension/src/background.js de verdade, num contexto isolado
 * do Node, com um `messenger` falso que imita a paginação do Thunderbird
 * (páginas de 100 mensagens; `id` nulo na última), e confere a rota
 * /messages/list, que atende o `tb list` e a ferramenta MCP `email_list`:
 *
 *   - com `sort`, a pasta INTEIRA é ordenada, e só depois valem offset e
 *     limite. Antes, só as primeiras mensagens guardadas (as mais antigas)
 *     eram ordenadas, e "mais novas primeiro" devolvia e-mails de 2025;
 *   - sem `sort`, a listagem continua lendo só o necessário, na ordem em
 *     que a pasta guarda as mensagens.
 *
 * Uso: npm run test:extensao
 */

import { readFileSync } from "fs";
import { createContext, runInContext } from "vm";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const CODIGO = readFileSync(join(RAIZ, "extension/src/background.js"), "utf8");
const PASTA_ID = "account5://INBOX";
const POR_PAGINA = 100; // tamanho de página padrão do messages.list

let passou = 0, falhou = 0;

function teste(nome, condicao, detalhe = "") {
  if (condicao) {
    console.log(`  \x1b[32m✓\x1b[0m ${nome}`);
    passou++;
  } else {
    console.log(`  \x1b[31m✗\x1b[0m ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
    falhou++;
  }
}

const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ─── A pasta falsa ──────────────────────────────────────────────────
//
// 250 mensagens, guardadas na ordem dos ids (1..250), como numa pasta IMAP.
// As datas NÃO seguem essa ordem, como acontece quando mensagens antigas
// são movidas para a pasta depois:
//
//   ids   1..200 → 01/01/2025 a 19/07/2025, uma por dia   (páginas 1 e 2)
//   ids 201..205 → 01/01/2024 a 05/01/2024: as MAIS ANTIGAS (página 3)
//   ids 206..250 → 05/08/2026 a 18/09/2026: as MAIS NOVAS   (página 3)
//
// Ids pares estão lidos; ímpares, não. Tamanho = 1000 + id.

const PASTA = {
  id: PASTA_ID, accountId: "account5", path: "/INBOX", name: "Entrada",
  specialUse: ["inbox"], type: "inbox", isFavorite: false, isRoot: false,
  isTag: false, isUnified: false, isVirtual: false,
};

const DIA = 86400000;
function dataDe(id) {
  if (id <= 200) return new Date(Date.UTC(2025, 0, 1, 12) + (id - 1) * DIA);
  if (id <= 205) return new Date(Date.UTC(2024, 0, id - 200, 12));
  return new Date(Date.UTC(2026, 7, 5, 12) + (id - 206) * DIA);
}

function cabecalho(id) {
  return {
    id,
    date: dataDe(id),
    author: `Remetente ${id} <r${id}@exemplo.com>`,
    subject: `Mensagem ${id}`,
    read: id % 2 === 0,
    new: false,
    flagged: false,
    junk: false,
    junkScore: 0,
    external: false,
    headersOnly: false,
    size: 1000 + id,
    tags: [],
    folder: PASTA,
    recipients: ["climedsch@gmail.com"],
    ccList: [],
    bccList: [],
    headerMessageId: `msg-${id}@exemplo.com`,
  };
}

const GUARDADAS = Array.from({ length: 250 }, (_, i) => cabecalho(i + 1));

// messages.list devolve a primeira página; continueList, as seguintes.
// A última página vem com id nulo, como no Thunderbird.
function criarMessenger() {
  const listas = new Map();
  let proxima = 0;
  const chamadas = { continueList: 0 };

  function pagina(inicio) {
    const messages = GUARDADAS.slice(inicio, inicio + POR_PAGINA);
    if (inicio + POR_PAGINA >= GUARDADAS.length) return { id: null, messages };
    const id = `lista-${++proxima}`;
    listas.set(id, inicio + POR_PAGINA);
    return { id, messages };
  }

  return {
    chamadas,
    folders: {
      async get(folderId) {
        if (folderId !== PASTA_ID) throw new Error(`pasta inexistente: ${folderId}`);
        return PASTA;
      },
    },
    messages: {
      async list(pasta) {
        const id = typeof pasta === "string" ? pasta : pasta?.id;
        if (id !== PASTA_ID) throw new Error(`pasta inesperada: ${id}`);
        return pagina(0);
      },
      async continueList(listaId) {
        chamadas.continueList++;
        if (!listas.has(listaId)) throw new Error(`lista desconhecida: ${listaId}`);
        const inicio = listas.get(listaId);
        listas.delete(listaId);
        return pagina(inicio);
      },
    },
  };
}

// A extensão abre um WebSocket ao carregar; aqui ele nunca conecta.
class WebSocketFalso {
  static OPEN = 1;
  constructor() { this.readyState = 0; }
  send() {}
  close() {}
}

function carregarExtensao(messenger) {
  const contexto = createContext({
    messenger,
    WebSocket: WebSocketFalso,
    console: { log() {}, warn() {}, error() {} },
    setTimeout,
    clearTimeout,
  });
  runInContext(CODIGO, contexto, { filename: "extension/src/background.js" });
  return contexto;
}

async function listar(corpo) {
  const messenger = criarMessenger();
  const extensao = carregarExtensao(messenger);
  const r = await extensao.handleRequest({
    method: "POST",
    path: "/messages/list",
    body: { folderId: PASTA_ID, ...corpo },
  });
  return { ids: r.messages.map((m) => m.id), r, chamadas: messenger.chamadas };
}

// ─── Testes ─────────────────────────────────────────────────────────

console.log("\nListagem de pasta na extensão (/messages/list)\n");

{
  const { ids } = await listar({ sort: "date", sortOrder: "desc", limit: 5 });
  teste("sort=date desc traz as 5 mais novas da pasta inteira",
    igual(ids, [250, 249, 248, 247, 246]), `veio ${JSON.stringify(ids)}`);
}

{
  const { ids, r } = await listar({ sort: "date", sortOrder: "desc", offset: 5, limit: 5 });
  teste("offset pagina depois de ordenar (da 6ª à 10ª mais nova)",
    igual(ids, [245, 244, 243, 242, 241]), `veio ${JSON.stringify(ids)}`);
  teste("hasMore avisa que ainda há mensagens depois dessa página",
    r.hasMore === true, `hasMore=${r.hasMore}`);
}

{
  const { ids } = await listar({ sort: "date", sortOrder: "asc", limit: 3 });
  teste("sort=date asc traz as 3 mais antigas, mesmo guardadas no fim",
    igual(ids, [201, 202, 203]), `veio ${JSON.stringify(ids)}`);
}

{
  const { ids } = await listar({ sort: "date", limit: 2 });
  teste("sort sem sortOrder ordena da mais nova para a mais antiga",
    igual(ids, [250, 249]), `veio ${JSON.stringify(ids)}`);
}

{
  const { ids } = await listar({ sort: "date", sortOrder: "desc", unreadOnly: true, limit: 2 });
  teste("filtro de não lidas vale para a pasta inteira antes de ordenar",
    igual(ids, [249, 247]), `veio ${JSON.stringify(ids)}`);
}

{
  const { ids } = await listar({ sort: "size", sortOrder: "desc", limit: 1 });
  teste("sort por outro campo também olha a pasta inteira",
    igual(ids, [250]), `veio ${JSON.stringify(ids)}`);
}

{
  const { ids, r } = await listar({ sort: "date", sortOrder: "desc", limit: 1000 });
  teste("limite maior que a pasta devolve tudo, da mais nova à mais antiga, sem hasMore",
    ids.length === 250 && ids[0] === 250 && ids[249] === 201 && r.hasMore === false,
    `veio ${ids.length} (primeira ${ids[0]}, última ${ids[ids.length - 1]}), hasMore=${r.hasMore}`);
}

{
  const { ids, chamadas } = await listar({ limit: 3 });
  teste("sem sort: devolve na ordem em que a pasta guarda",
    igual(ids, [1, 2, 3]), `veio ${JSON.stringify(ids)}`);
  teste("sem sort: lê só a primeira página",
    chamadas.continueList === 0, `continueList chamado ${chamadas.continueList} vez(es)`);
}

console.log(`\n${passou} passaram, ${falhou} falharam\n`);
process.exit(falhou ? 1 : 0);
