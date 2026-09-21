#!/usr/bin/env node
/**
 * Quick test — single process, no subprocess spawning.
 * Directly imports and tests the HTTP client against a mock bridge.
 *
 * Exceção (acréscimo pessoal): a trava de envio do CLI roda o cli.js de
 * verdade, em subprocesso, contra a ponte simulada.
 */

import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";
import { execFile } from "child_process";
import { fileURLToPath } from "url";
import { caminhoSeguroDeAnexo } from "../cli/src/client.js";

const PORT = 19700;
const WS_PORT = 19701;
let passed = 0, failed = 0;

// Respostas das travas pessoais que continuam em extension/src/background.js.
// O envio foi liberado lá em 03/09/2026 (commit 924a64e): a ponte simulada
// envia, como a extensão real, e anota cada envio que recebe.
const enviosNaPonte = [];
const BLOQUEIO_PERMANENTE = { error: "EXCLUSAO_PERMANENTE_BLOQUEADA: esta versão nunca apaga em definitivo.", code: "EXCLUSAO_PERMANENTE_BLOQUEADA" };
const BLOQUEIO_PASTA = { error: "EXCLUSAO_DE_PASTA_BLOQUEADA: esta versão nunca apaga pastas.", code: "EXCLUSAO_DE_PASTA_BLOQUEADA" };

function handle({ method, path, body }) {
  if (path === "/health") return { status: "ok", version: "2.0.0", thunderbird: true };
  if (path === "/accounts") return [{ id: "acct1", name: "Test", type: "imap", identities: [{ id: "id1", email: "t@t.com", name: "T" }], rootFolder: { id: "rf", name: "" } }];
  if (path?.match(/^\/accounts\/[^/]+$/) && method === "GET") return { id: "acct1", name: "Test" };
  if (path?.match(/^\/accounts\/[^/]+\/folders$/)) return [{ id: "f1", name: "Inbox", path: "/Inbox", type: "inbox", depth: 0, unreadMessageCount: 5, totalMessageCount: 50 }];
  if (path === "/identities") return [{ id: "id1", email: "t@t.com", accountId: "acct1" }];
  if (path === "/folders/info") return { id: body?.folderId, name: "Inbox", type: "inbox", unreadMessageCount: 5, totalMessageCount: 50 };
  if (path === "/folders/create") return { success: true, folder: { id: "fn", name: body?.name } };
  if (path === "/folders/rename") return { success: true, folder: { id: body?.folderId, name: body?.newName } };
  if (path === "/folders/delete") return BLOQUEIO_PASTA;
  if (path === "/messages/search") return { messages: [{ id: 1, subject: "Test", author: "a@b.com", date: "2026-04-01", read: false, flagged: false, junk: false, size: 100, tags: [], folder: { accountId: "acct1", path: "/Inbox" } }], total: 1 };
  if (path === "/messages/list") return { messages: [{ id: 1, subject: "Test", author: "a@b.com", date: "2026-04-01", read: false, flagged: false, junk: false, size: 100, tags: ["$l1"], folder: { accountId: "acct1", path: "/Inbox" } }], total: 1 };
  if (path === "/messages/read-batch") return (body?.messageIds || []).map(id => ({ id, subject: "T", parts: { text: "Hello" } }));
  if (path === "/messages/fetch") return body?.messageId ? { downloaded: true, size: 100 } : { fetched: 2, total: 2 };
  if (path === "/messages/archive") return { success: true, archived: (body?.messageIds || []).length };
  if (path === "/messages/move") return { success: true, moved: (body?.messageIds || []).length };
  if (path === "/messages/copy") return { success: true, copied: (body?.messageIds || []).length };
  if (path === "/messages/delete") return body?.permanent ? BLOQUEIO_PERMANENTE : { success: true, deleted: (body?.messageIds || []).length, destino: "Lixeira" };
  if (path === "/messages/update") return { success: true };
  if (path?.match(/\/raw$/)) return { raw: "From: a@b\nSubject: T\n\nBody" };
  if (path?.match(/\/headers$/)) return { id: 1, subject: "T", author: "a@b" };
  if (path?.match(/\/full$/)) return { id: 1, subject: "T", parts: { text: "Hello", html: "<p>Hello</p>", attachments: [] } };
  if (path?.match(/\/check-download$/)) return { id: 1, downloadState: "full", size: 100, hasBody: true };
  if (path?.match(/\/download-status$/)) return { state: "full", size: 100 };
  if (path?.match(/\/attachments$/)) return [{ name: "f.pdf", contentType: "application/pdf", partName: "1.2", size: 5000 }];
  if (path?.match(/\/attachment$/) && method === "POST") return { name: "f.pdf", size: 5000, data: "SGVsbG8=" };
  if (path?.match(/\/thread$/)) return { thread: [{ id: 1, subject: "T" }], count: 1 };
  if (path?.match(/^\/messages\/\d+$/) && method === "GET") return { id: 1, subject: "T", author: "a@b", date: "2026-04-01", read: false, flagged: false, junk: false, size: 100, tags: ["$l1"], folder: null, parts: { text: "Hello world", html: "", attachments: [] } };
  if (path === "/tags") return [{ key: "$l1", tag: "Important", color: "#FF0000" }];
  if (path === "/tags/create") return { success: true, ...body };
  // Como a extensão real desde 03/09: com send, envia.
  if (path === "/compose" || path === "/reply" || path === "/forward") {
    if (body?.send) { enviosNaPonte.push(path); return { success: true, action: "sent" }; }
    return { success: true, action: body?.open ? "draft_opened" : "draft_saved" };
  }
  if (path === "/stats") return { totalAccounts: 1, totalUnread: 5, totalMessages: 100, accounts: [] };
  if (path === "/recent") return { messages: [], total: 0, since: new Date().toISOString() };
  if (path === "/contacts/search") return [{ id: "c1", name: "John", email: "j@e.com" }];
  if (path === "/contacts" && method === "GET") return [{ id: "c1", name: "John", email: "j@e.com", book: "P" }];
  if (path?.match(/^\/contacts\/[^/]+$/)) return { id: "c1", properties: { DisplayName: "John" } };
  if (path === "/sync") return { success: true, synced: body?.all ? "all" : body?.folderId };
  if (path === "/sync/status") return { folderId: body?.folderId, totalMessages: 50, unread: 5 };
  if (path === "/bulk/delete") return { success: true, deleted: 3 };
  if (path === "/bulk/tag") return { success: true, tagged: 5 };
  if (path === "/bulk/fetch") return { success: true, fetched: 10, total: 10 };
  return { error: `Not found: ${method} ${path}` };
}

async function startBridge() {
  return new Promise((resolve) => {
    const pending = new Map();
    let extSock = null;
    const wss = new WebSocketServer({ host: "127.0.0.1", port: WS_PORT });
    wss.on("connection", ws => {
      extSock = ws;
      ws.on("message", d => {
        const m = JSON.parse(d.toString());
        const p = pending.get(m.id);
        if (p) { pending.delete(m.id); clearTimeout(p.timer); p.resolve(m.result); }
      });
    });
    const httpServer = createServer(async (req, res) => {
      res.setHeader("Content-Type", "application/json");
      if (req.url === "/bridge/status") { res.writeHead(200); res.end(JSON.stringify({ bridge: "running", extension: "connected" })); return; }
      let b = ""; for await (const c of req) b += c;
      let pb = null; if (b.trim()) try { pb = JSON.parse(b); } catch {}
      try {
        const result = await new Promise((resolve, reject) => {
          if (!extSock || extSock.readyState !== 1) { reject(new Error("no ext")); return; }
          const id = randomUUID();
          const timer = setTimeout(() => { pending.delete(id); reject(new Error("timeout")); }, 5000);
          pending.set(id, { resolve, reject, timer });
          extSock.send(JSON.stringify({ id, method: req.method, path: req.url, body: pb }));
        });
        res.writeHead(200); res.end(JSON.stringify(result));
      } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
    });
    httpServer.listen(PORT, "127.0.0.1", () => {
      const mock = new WebSocket(`ws://127.0.0.1:${WS_PORT}`);
      mock.on("open", () => resolve({ httpServer, wss, mock }));
      mock.on("message", d => {
        const r = JSON.parse(d.toString());
        mock.send(JSON.stringify({ id: r.id, result: handle(r) }));
      });
    });
  });
}

// ─── Direct HTTP test (no CLI subprocess) ──────────────────────────

// Roda o cli.js de verdade apontado para a ponte simulada, com token de teste.
const CLI = fileURLToPath(new URL("../cli/src/cli.js", import.meta.url));
function rodarCli(args) {
  const env = { ...process.env, TB_BRIDGE_HOST: "127.0.0.1", TB_BRIDGE_PORT: String(PORT), TB_AUTH_TOKEN: "token-de-teste" };
  return new Promise((resolve) => {
    execFile(process.execPath, [CLI, ...args], { env, timeout: 30000 }, (erro, stdout, stderr) => {
      let json = null;
      try { json = JSON.parse(stdout || stderr); } catch {}
      resolve({ saida: erro ? erro.code : 0, json });
    });
  });
}

async function httpCall(method, path, body = null) {
  const url = `http://127.0.0.1:${PORT}${path}`;
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return await res.json();
}

function test(name, result, check) {
  if (check(result)) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  else {
    failed++;
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    ${JSON.stringify(result).slice(0, 200)}`);
  }
}

const servers = await startBridge();
await new Promise(r => setTimeout(r, 300));

console.log("\n\x1b[1m=== thunderbird-cli API Tests ===\x1b[0m\n");

console.log("\x1b[1mConnection\x1b[0m");
test("GET /health", await httpCall("GET", "/health"), r => r.status === "ok");
test("GET /bridge/status", await httpCall("GET", "/bridge/status"), r => r.bridge === "running");

console.log("\n\x1b[1mAccounts\x1b[0m");
test("GET /accounts", await httpCall("GET", "/accounts"), r => Array.isArray(r) && r.length === 1);
test("GET /accounts/:id", await httpCall("GET", "/accounts/acct1"), r => r.id === "acct1");
test("GET /identities", await httpCall("GET", "/identities"), r => Array.isArray(r) && r[0]?.email);
test("GET /accounts/:id/folders", await httpCall("GET", "/accounts/acct1/folders"), r => Array.isArray(r));

console.log("\n\x1b[1mFolders\x1b[0m");
test("POST /folders/info", await httpCall("POST", "/folders/info", { folderId: "f1" }), r => r.name === "Inbox");
test("POST /folders/create", await httpCall("POST", "/folders/create", { parentFolderId: "f1", name: "New" }), r => r.success);
test("POST /folders/rename", await httpCall("POST", "/folders/rename", { folderId: "f1", newName: "X" }), r => r.success);

console.log("\n\x1b[1mSearch & List\x1b[0m");
test("POST /messages/search", await httpCall("POST", "/messages/search", { query: "test", limit: 25 }), r => r.messages?.length >= 0);
test("POST /messages/list", await httpCall("POST", "/messages/list", { folderId: "f1", limit: 25 }), r => r.messages?.length >= 0);

console.log("\n\x1b[1mRead\x1b[0m");
test("GET /messages/1", await httpCall("GET", "/messages/1"), r => r.id === 1 && r.parts);
test("GET /messages/1/raw", await httpCall("GET", "/messages/1/raw"), r => r.raw);
test("GET /messages/1/headers", await httpCall("GET", "/messages/1/headers"), r => r.id === 1);
test("GET /messages/1/full", await httpCall("GET", "/messages/1/full"), r => r.parts?.html !== undefined);
test("GET /messages/1/thread", await httpCall("GET", "/messages/1/thread"), r => r.thread);
test("GET /messages/1/check-download", await httpCall("GET", "/messages/1/check-download"), r => r.downloadState);
test("GET /messages/1/download-status", await httpCall("GET", "/messages/1/download-status"), r => r.state === "full");
test("GET /messages/1/attachments", await httpCall("GET", "/messages/1/attachments"), r => Array.isArray(r));
test("POST /messages/1/attachment", await httpCall("POST", "/messages/1/attachment", { partName: "1.2" }), r => r.data);
test("POST /messages/read-batch", await httpCall("POST", "/messages/read-batch", { messageIds: [1, 2] }), r => Array.isArray(r) && r.length === 2);

console.log("\n\x1b[1mActions\x1b[0m");
test("POST /messages/move", await httpCall("POST", "/messages/move", { messageIds: [1], destinationFolderId: "f2" }), r => r.success);
test("POST /messages/copy", await httpCall("POST", "/messages/copy", { messageIds: [1], destinationFolderId: "f2" }), r => r.success);
test("POST /messages/delete", await httpCall("POST", "/messages/delete", { messageIds: [1] }), r => r.success);
test("POST /messages/archive", await httpCall("POST", "/messages/archive", { messageIds: [1, 2] }), r => r.success && r.archived === 2);
test("POST /messages/update", await httpCall("POST", "/messages/update", { messageId: 1, read: true }), r => r.success);
test("POST /messages/fetch", await httpCall("POST", "/messages/fetch", { messageId: 1 }), r => r.downloaded);

console.log("\n\x1b[1mTags\x1b[0m");
test("GET /tags", await httpCall("GET", "/tags"), r => Array.isArray(r));
test("POST /tags/create", await httpCall("POST", "/tags/create", { key: "k", tag: "T", color: "#FFF" }), r => r.success);

console.log("\n\x1b[1mCompose\x1b[0m");
test("POST /compose draft", await httpCall("POST", "/compose", { to: "a@b", subject: "T", body: "Hi" }), r => r.success && r.action === "draft_saved");
test("POST /compose open", await httpCall("POST", "/compose", { to: "a@b", body: "Hi", open: true }), r => r.action === "draft_opened");
test("POST /reply", await httpCall("POST", "/reply", { messageId: 1, body: "Thanks" }), r => r.success);
test("POST /forward", await httpCall("POST", "/forward", { messageId: 1, to: "c@d", body: "FYI" }), r => r.success);

console.log("\n\x1b[1mTravas pessoais (Fase 4)\x1b[0m");
// A extensão envia desde 03/09; a trava de envio que sobrou vive no CLI (e no
// servidor MCP, ver mcp-test.mjs). O controle prova que o CLI alcança a ponte;
// sem ele, "nenhum envio chegou" passaria até com o CLI desconectado.
test("CLI alcança a ponte (controle: compose sem --send vira rascunho)", await rodarCli(["compose", "--to", "a@b.com", "--subject", "Oi", "--body", "Oi"]), r => r.saida === 0 && r.json?.data?.action === "draft_saved");
test("CLI recusa compose --send", await rodarCli(["compose", "--to", "a@b.com", "--subject", "Oi", "--body", "Oi", "--send"]), r => r.saida === 1 && r.json?.code === "ENVIO_BLOQUEADO");
test("CLI recusa reply --send", await rodarCli(["reply", "1", "--body", "Oi", "--send"]), r => r.saida === 1 && r.json?.code === "ENVIO_BLOQUEADO");
test("CLI recusa forward --send", await rodarCli(["forward", "1", "--to", "c@d.com", "--send"]), r => r.saida === 1 && r.json?.code === "ENVIO_BLOQUEADO");
test("nenhum envio chegou à ponte pelo CLI", enviosNaPonte, e => e.length === 0);
test("exclusao permanente bloqueada", await httpCall("POST", "/messages/delete", { messageIds: [1], permanent: true }), r => r.code === "EXCLUSAO_PERMANENTE_BLOQUEADA" && !r.success);
test("delete normal vai para a Lixeira", await httpCall("POST", "/messages/delete", { messageIds: [1] }), r => r.success && r.destino === "Lixeira");
test("exclusao de pasta bloqueada", await httpCall("POST", "/folders/delete", { folderId: "f1" }), r => r.code === "EXCLUSAO_DE_PASTA_BLOQUEADA" && !r.success);

// Nome de anexo é escolhido por quem manda o e-mail — conteúdo hostil.
const juntar = (d, n) => `${d}/${n}`;
const nunca = () => false;
test("anexo com ../ nao escapa da pasta", caminhoSeguroDeAnexo("/destino", "../../../.zshrc", "1.2", nunca, juntar), c => c === "/destino/zshrc");
test("anexo com caminho absoluto nao escapa", caminhoSeguroDeAnexo("/destino", "/etc/passwd", "1.2", nunca, juntar), c => c === "/destino/passwd");
test("anexo com barra invertida nao escapa", caminhoSeguroDeAnexo("/destino", "..\\..\\windows\\system32\\x.dll", "1.2", nunca, juntar), c => c === "/destino/x.dll");
test("anexo oculto deixa de ser oculto", caminhoSeguroDeAnexo("/destino", ".ssh", "1.2", nunca, juntar), c => c === "/destino/ssh");
test("anexo sem nome ganha nome", caminhoSeguroDeAnexo("/destino", "", "1.2", nunca, juntar), c => c === "/destino/anexo-1.2");
test("anexo nao sobrescreve arquivo existente", caminhoSeguroDeAnexo("/destino", "nota.pdf", "1.2", (c) => c === "/destino/nota.pdf", juntar), c => c === "/destino/nota (1).pdf");
test("anexo normal passa intacto", caminhoSeguroDeAnexo("/destino", "contrato.pdf", "1.2", nunca, juntar), c => c === "/destino/contrato.pdf");

console.log("\n\x1b[1mStats & Recent\x1b[0m");
test("GET /stats", await httpCall("GET", "/stats"), r => r.totalAccounts === 1);
test("POST /stats", await httpCall("POST", "/stats", { accountId: "acct1" }), r => r.totalAccounts !== undefined);
test("POST /recent", await httpCall("POST", "/recent", { hours: 24, limit: 50 }), r => r.messages !== undefined);

console.log("\n\x1b[1mContacts\x1b[0m");
test("GET /contacts", await httpCall("GET", "/contacts"), r => Array.isArray(r));
test("POST /contacts/search", await httpCall("POST", "/contacts/search", { query: "john" }), r => Array.isArray(r));
test("GET /contacts/c1", await httpCall("GET", "/contacts/c1"), r => r.id === "c1");

console.log("\n\x1b[1mSync\x1b[0m");
test("POST /sync", await httpCall("POST", "/sync", { all: true }), r => r.success);
test("POST /sync/status", await httpCall("POST", "/sync/status", { folderId: "f1" }), r => r.totalMessages);

console.log("\n\x1b[1mBulk\x1b[0m");
test("POST /bulk/delete", await httpCall("POST", "/bulk/delete", { folderId: "f1" }), r => r.success);
test("POST /bulk/tag", await httpCall("POST", "/bulk/tag", { folderId: "f1", tagKey: "$l1" }), r => r.success);
test("POST /bulk/fetch", await httpCall("POST", "/bulk/fetch", { folderId: "f1" }), r => r.success);

console.log(`\n\x1b[1m${"─".repeat(40)}\x1b[0m`);
console.log(`\x1b[1m${passed} passed, ${failed} failed, ${passed + failed} total\x1b[0m\n`);

servers.mock.close();
servers.wss.close();
servers.httpServer.close();
process.exit(failed > 0 ? 1 : 0);
