#!/usr/bin/env node

/**
 * Thunderbird AI Bridge Server
 *
 * HTTP server (port 7700) for CLI requests.
 * WebSocket server (port 7701) for Thunderbird extension.
 * Forwards: CLI HTTP → WebSocket → Extension → response.
 *
 * Usage: node bridge.js [--port 7700] [--ws-port 7701]
 *
 * Environment variables:
 *   TB_BRIDGE_TIMEOUT  default per-request timeout in ms (default: 120000)
 *
 * Per-request override: HTTP clients can pass `X-TB-Timeout: <ms>` header.
 */

import { createServer } from "http";
import { WebSocketServer } from "ws";
import { randomUUID, timingSafeEqual } from "crypto";
import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const HTTP_PORT = parseInt(process.argv.find((_, i, a) => a[i - 1] === "--port") || "7700");
const WS_PORT = parseInt(process.argv.find((_, i, a) => a[i - 1] === "--ws-port") || "7701");
const DEFAULT_TIMEOUT = parseInt(process.env.TB_BRIDGE_TIMEOUT || "120000");

let extensionSocket = null;
const pending = new Map(); // id → { resolve, reject, timer }

// ─── Autenticação da ponte (acréscimo pessoal) ──────────────────────
//
// A versão original do projeto anunciava um TB_AUTH_TOKEN mas nunca o
// verificava: o campo era decorativo. Na prática, qualquer programa
// rodando nesta máquina podia falar com a porta 7700 e ler, enviar e
// apagar e-mail nas minhas contas, sem senha nenhuma. Ver AUDITORIA.md.
//
// Agora o token é exigido de verdade. Sem token configurado, a ponte se
// recusa a subir — em vez de subir desprotegida em silêncio.

const CAMINHOS_CONFIG = [
  join(homedir(), ".config", "thunderbird-cli", "config.json"),
  join(homedir(), ".config", "thunderbird-ai", "config.json"),
];

function carregarToken() {
  if (process.env.TB_AUTH_TOKEN) return process.env.TB_AUTH_TOKEN;
  for (const caminho of CAMINHOS_CONFIG) {
    if (!existsSync(caminho)) continue;
    try {
      const cfg = JSON.parse(readFileSync(caminho, "utf-8"));
      const token = cfg.bridge?.authToken || cfg.authToken;
      if (token) return token;
    } catch {
      console.error(`[ponte] Aviso: não consegui ler ${caminho}`);
    }
  }
  return null;
}

const AUTH_TOKEN = carregarToken();

if (!AUTH_TOKEN) {
  console.error(`
[ponte] RECUSANDO SUBIR: nenhum token de autenticação configurado.

  Sem token, qualquer programa desta máquina conseguiria ler, enviar e
  apagar e-mail nas suas contas. Esta versão não sobe assim.

  Para gerar um token e gravá-lo na configuração, rode:

    node scripts/gerar-token.mjs

  Ou defina a variável de ambiente TB_AUTH_TOKEN.
`);
  process.exit(1);
}

// Comparação em tempo constante, para não vazar o token caractere a
// caractere pelo tempo de resposta.
function tokenConfere(req) {
  const cabecalho = req.headers["authorization"] || "";
  const recebido = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : "";
  const a = Buffer.from(recebido);
  const b = Buffer.from(AUTH_TOKEN);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Clientes legítimos (o CLI e o servidor MCP) nunca mandam Origin nem
// Referer — só navegadores mandam. Recusar esses cabeçalhos impede que
// uma página web aberta no navegador converse com a ponte.
function pareceNavegador(req) {
  return Boolean(req.headers.origin || req.headers.referer);
}

// Defesa contra DNS rebinding: só aceitamos o Host apontando para a
// máquina local. Um domínio externo que resolva para 127.0.0.1 é barrado.
function hostConfere(req) {
  const host = (req.headers.host || "").toLowerCase();
  return host === `127.0.0.1:${HTTP_PORT}` || host === `localhost:${HTTP_PORT}`;
}

// ─── WebSocket Server (for extension) ───────────────────────────────

const wss = new WebSocketServer({ host: "127.0.0.1", port: WS_PORT });

wss.on("connection", (ws) => {
  // Só uma extensão por vez. Se já existe uma conexão viva, a nova é
  // recusada — assim outro programa desta máquina não consegue tomar o
  // lugar da extensão do Thunderbird e servir e-mails falsos ao agente.
  if (extensionSocket && extensionSocket.readyState === 1) {
    console.warn("[bridge] Recusando segunda conexão: já há uma extensão conectada.");
    ws.close(4001, "Ja existe uma extensao conectada");
    return;
  }
  console.log("[bridge] Extension connected");
  extensionSocket = ws;

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      const p = pending.get(msg.id);
      if (p) {
        pending.delete(msg.id);
        clearTimeout(p.timer);
        if (msg.error) {
          p.reject(msg.error);
        } else {
          p.resolve(msg.result);
        }
      }
    } catch (e) {
      console.error("[bridge] Bad message from extension:", e.message);
    }
  });

  ws.on("close", () => {
    console.log("[bridge] Extension disconnected");
    if (extensionSocket === ws) extensionSocket = null;
  });
});

// ─── Forward request to extension ───────────────────────────────────

function forwardToExtension(method, path, body, timeoutMs = DEFAULT_TIMEOUT) {
  return new Promise((resolve, reject) => {
    if (!extensionSocket || extensionSocket.readyState !== 1) {
      reject({ message: "Thunderbird extension not connected. Is Thunderbird running?" });
      return;
    }
    const id = randomUUID();
    const timer = setTimeout(() => {
      pending.delete(id);
      reject({ message: `Request timed out (${Math.round(timeoutMs / 1000)}s)` });
    }, timeoutMs);
    pending.set(id, { resolve, reject, timer });
    extensionSocket.send(JSON.stringify({ id, method, path, body }));
  });
}

// ─── HTTP Server (for CLI) ──────────────────────────────────────────

const httpServer = createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  // Sem CORS de propósito. A versão original respondia
  // "Access-Control-Allow-Origin: *", o que abria a ponte para qualquer
  // página web aberta no navegador. Os clientes desta ponte são processos
  // locais (CLI e servidor MCP), que não precisam de CORS.

  if (pareceNavegador(req)) {
    res.writeHead(403);
    res.end(JSON.stringify({
      error: "Requisição vinda de navegador recusada. Esta ponte só atende processos locais.",
      code: "ORIGEM_RECUSADA",
    }));
    return;
  }

  if (!hostConfere(req)) {
    res.writeHead(403);
    res.end(JSON.stringify({
      error: "Host inválido. Use 127.0.0.1 ou localhost.",
      code: "HOST_INVALIDO",
    }));
    return;
  }

  if (!tokenConfere(req)) {
    res.writeHead(401);
    res.end(JSON.stringify({
      error: "Token de autenticação ausente ou incorreto. Rode 'node scripts/gerar-token.mjs'.",
      code: "NAO_AUTORIZADO",
    }));
    return;
  }

  // Bridge status endpoint (doesn't need extension)
  if (req.url === "/bridge/status") {
    const status = {
      bridge: "running",
      extension: extensionSocket ? "connected" : "disconnected",
      httpPort: HTTP_PORT,
      wsPort: WS_PORT,
      defaultTimeoutMs: DEFAULT_TIMEOUT,
    };
    res.writeHead(200);
    res.end(JSON.stringify(status));
    return;
  }

  // Read body
  let body = "";
  for await (const chunk of req) body += chunk;

  let parsedBody = null;
  if (body.trim()) {
    try {
      parsedBody = JSON.parse(body);
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Invalid JSON body" }));
      return;
    }
  }

  // Per-request timeout override via X-TB-Timeout header
  let timeoutMs = DEFAULT_TIMEOUT;
  const headerTimeout = req.headers["x-tb-timeout"];
  if (headerTimeout) {
    const parsed = parseInt(headerTimeout);
    if (parsed > 0) timeoutMs = parsed;
  }

  // Forward to extension
  try {
    const result = await forwardToExtension(req.method, req.url, parsedBody, timeoutMs);
    res.writeHead(200);
    res.end(JSON.stringify(result));
  } catch (err) {
    const status = err.message?.includes("not connected") ? 503 : 500;
    res.writeHead(status);
    res.end(JSON.stringify({ error: err.message || "Unknown error" }));
  }
});

httpServer.listen(HTTP_PORT, "127.0.0.1", () => {
  console.log(`[bridge] HTTP server on http://127.0.0.1:${HTTP_PORT}`);
  console.log(`[bridge] WebSocket server on ws://127.0.0.1:${WS_PORT}`);
  console.log(`[bridge] Default timeout: ${DEFAULT_TIMEOUT}ms (override via TB_BRIDGE_TIMEOUT env or X-TB-Timeout header)`);
  console.log(`[bridge] Autenticação por token: ATIVA. CORS: desligado.`);
  console.log(`[bridge] Waiting for Thunderbird extension to connect...`);
});
