#!/usr/bin/env node
// Creates or updates the ElevenLabs agent "Lina" from scripts/elevenlabs/agent-config.mjs.
//
//   node scripts/elevenlabs/setup-agent.mjs --dry-run      # print JSON, no key needed
//   node scripts/elevenlabs/setup-agent.mjs                # create (or update if ELEVENLABS_AGENT_ID is set)
//
// Env (read from the shell, then .env.local / .env if present):
//   ELEVENLABS_API_KEY (required unless --dry-run), ELEVENLABS_AGENT_ID (optional: update instead of create),
//   NEXT_PUBLIC_APP_URL (allowlist + webhook URL hint), optional ELEVENLABS_LLM, ELEVENLABS_TTS_MODEL,
//   ELEVENLABS_VOICE_ID, ELEVENLABS_VOICE_ID_IT, ELEVENLABS_POST_CALL_WEBHOOK_ID.
// Flags: --dry-run, --no-allowlist (skip the hostname allowlist, e.g. for preview deployments).

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CLIENT_TOOLS, buildAgentBody } from "./agent-config.mjs";

const API = process.env.ELEVENLABS_API_BASE || "https://api.elevenlabs.io";
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const allowlist = !args.has("--no-allowlist");

function loadEnvFile(file) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    let v = m[2];
    if (/^(["']).*\1$/.test(v)) v = v.slice(1, -1);
    else v = v.replace(/\s+#.*$/, "");
    process.env[m[1]] = v;
  }
}
loadEnvFile(".env.local");
loadEnvFile(".env");

const env = Object.fromEntries(Object.entries(process.env).map(([k, v]) => [k, v?.trim() || undefined]));
const apiKey = env.ELEVENLABS_API_KEY;
const agentId = env.ELEVENLABS_AGENT_ID;
const appUrl = (env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

async function api(method, path, body) {
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    fail(`${method} ${path} – network error: ${e instanceof Error ? e.message : e}`);
  }
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const detail = Array.isArray(json.detail)
      ? json.detail.map((d) => `  - ${(d.loc ?? []).join(".")}: ${d.msg}`).join("\n")
      : JSON.stringify(json.detail ?? json, null, 2);
    const hint = res.status === 401 ? "\n  Hint: check ELEVENLABS_API_KEY (and that it has Agents/ConvAI write permission)." : "";
    fail(`ElevenLabs API ${method} ${path} failed with ${res.status}:\n${detail}${hint}`);
  }
  return json;
}

/** Find a client tool by exact name in the workspace (paginated). */
async function findTool(name) {
  let cursor;
  for (let page = 0; page < 20; page++) {
    const qs = new URLSearchParams({ search: name, types: "client", page_size: "100" });
    if (cursor) qs.set("cursor", cursor);
    const res = await api("GET", `/v1/convai/tools?${qs}`);
    const hit = (res.tools ?? []).find((t) => t.tool_config?.name === name && t.tool_config?.type === "client");
    if (hit) return hit;
    if (!res.has_more || !res.next_cursor) return null;
    cursor = res.next_cursor;
  }
  return null;
}

async function upsertTools() {
  const ids = [];
  for (const tool of CLIENT_TOOLS) {
    const existing = await findTool(tool.name);
    if (existing) {
      await api("PATCH", `/v1/convai/tools/${encodeURIComponent(existing.id)}`, { tool_config: tool });
      console.log(`  ✓ tool ${tool.name} updated (${existing.id})`);
      ids.push(existing.id);
    } else {
      const created = await api("POST", "/v1/convai/tools", { tool_config: tool });
      if (!created.id) fail(`Tool ${tool.name} was created but no id was returned.`);
      console.log(`  ✓ tool ${tool.name} created (${created.id})`);
      ids.push(created.id);
    }
  }
  return ids;
}

function printNextSteps(id) {
  console.log(`
Agent id: ${id}

Paste into .env.local (and the Vercel project env):

ELEVENLABS_AGENT_ID=${id}
ELEVENLABS_API_KEY=<the key you used>
ELEVENLABS_WEBHOOK_SECRET=<secret shown when you create the post-call webhook>

Post-call webhook (workspace-level, once): ElevenLabs → Agents → Settings → Post-call webhook
  URL:    ${appUrl}/api/elevenlabs/webhook
  Events: transcript (post_call_transcription)
  Then copy the secret into ELEVENLABS_WEBHOOK_SECRET. To pin it to this agent, set
  ELEVENLABS_POST_CALL_WEBHOOK_ID=<webhook id> and re-run this script.`);
}

async function main() {
  if (dryRun) {
    const toolIds = CLIENT_TOOLS.map((t) => `<tool_id:${t.name}>`);
    const body = buildAgentBody({ toolIds, appUrl, env, allowlist });
    console.log(
      JSON.stringify(
        {
          mode: agentId ? `update ${agentId}` : "create",
          tools: CLIENT_TOOLS.map((t) => ({ method: "POST|PATCH /v1/convai/tools", body: { tool_config: t } })),
          agent: { method: agentId ? `PATCH /v1/convai/agents/${agentId}` : "POST /v1/convai/agents/create", body },
        },
        null,
        2,
      ),
    );
    console.error(`\n(dry run – nothing was sent. ${CLIENT_TOOLS.length} client tools, prompt ${body.conversation_config.agent.prompt.prompt.length} chars)`);
    return;
  }

  if (!apiKey) fail("ELEVENLABS_API_KEY is not set. Put it in .env.local or run with ELEVENLABS_API_KEY=... (use --dry-run to preview).");

  console.log("Upserting client tools …");
  const toolIds = await upsertTools();
  const body = buildAgentBody({ toolIds, appUrl, env, allowlist });

  let id = agentId;
  if (agentId) {
    console.log(`Updating agent ${agentId} …`);
    const res = await api("PATCH", `/v1/convai/agents/${encodeURIComponent(agentId)}`, body);
    id = res.agent_id ?? agentId;
  } else {
    console.log("Creating agent …");
    const res = await api("POST", "/v1/convai/agents/create", body);
    if (!res.agent_id) fail("Agent was created but no agent_id was returned.");
    id = res.agent_id;
  }
  console.log(`✓ Agent "${body.name}" ${agentId ? "updated" : "created"}.`);
  printNextSteps(id);
}

main().catch((e) => fail(e instanceof Error ? e.stack ?? e.message : String(e)));
