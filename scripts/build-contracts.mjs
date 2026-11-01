// Builds token-level contracts from component contracts + tokens/figma-variables.json.
// For each src/components/*/*.contract.json (excluding *.tokens.contract.json) it writes
// <name>.tokens.contract.json next to it.
// Usage: node scripts/build-contracts.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = JSON.parse(readFileSync(join(root, "tokens/figma-variables.json"), "utf8"));
const [primitives, semantic, component] = src.collections;
const tiers = { component, semantic, primitive: primitives };
const order = ["component", "semantic", "primitive"];
const byName = Object.fromEntries(order.map((t) => [t, new Map(tiers[t].variables.map((v) => [v.name, v]))]));

const MODES = { light: "Light", dark: "Dark" };
const SHADOW_PARTS = ["x", "y", "blur", "spread", "colour"];
const TYPE_PARTS = ["family", "font-size", "line-height", "weight", "letter-spacing"];

const cssVar = (path) => "--" + path.split("/").map((s) => (s === "colour" ? "color" : s)).join("-");
const dot = (path) => path.replaceAll("/", ".");
const isAlias = (v) => v && typeof v === "object" && "alias" in v;
const typeName = { COLOR: "color", FLOAT: "dimension", STRING: "fontFamily" };

function rawValue(tier, v, mode) {
  return tier === "semantic" ? v.values[mode] : v.values.Base;
}

function resolve(name, mode) {
  const chain = [];
  let tier = "component";
  let v = byName.component.get(name);
  while (v) {
    const value = rawValue(tier, v, mode);
    if (!isAlias(value)) return { chain, value };
    const next = order.slice(order.indexOf(tier) + 1).find((t) => byName[t].has(value.alias));
    chain.push({ tier: next, name: dot(value.alias) });
    tier = next;
    v = byName[next]?.get(value.alias);
  }
  return { chain, value: undefined };
}

function format(value, name) {
  if (typeof value !== "number") return value;
  if (name.endsWith("/weight")) return value;
  return value === 0 ? "0" : `${value}px`;
}

// --- WCAG contrast -----------------------------------------------------------
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100;
}

// --- Template expansion --------------------------------------------------------
// "{button.{variant}.background.default}" -> one ref per enum value of `variant`.
function expand(template, props) {
  const inner = template.slice(1, -1);
  const params = [...inner.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
  let combos = [{ path: inner, when: {} }];
  for (const p of params) {
    const values = props.find((x) => x.name === p)?.type?.enum;
    if (!values) throw new Error(`Template parameter {${p}} is not an enum prop`);
    combos = combos.flatMap((c) =>
      values.map((val) => ({ path: c.path.replace(`{${p}}`, val), when: { ...c.when, [p]: val } })),
    );
  }
  return combos.map((c) => ({ figma: c.path.replaceAll(".", "/"), when: c.when }));
}

const isTokenRef = (v) => typeof v === "string" && /^\{.+\}$/.test(v);

function buildTokenContract(contract, contractPath) {
  const props = contract.props;
  const usages = new Map(); // figma name -> usage[]
  const composites = new Map();
  const missing = [];
  const literals = [];

  const addUsage = (figma, usage) => {
    if (!usages.has(figma)) usages.set(figma, []);
    usages.get(figma).push(usage);
  };

  for (const [part, spec] of Object.entries(contract.anatomy)) {
    const blocks = [["default", spec.tokens ?? {}], ...Object.entries(spec.states ?? {})];
    for (const [state, map] of blocks) {
      for (const [property, ref] of Object.entries(map)) {
        if (!isTokenRef(ref)) {
          literals.push({ part, state, property, value: ref });
          continue;
        }
        for (const { figma, when } of expand(ref, props)) {
          const usage = { part, property, state, ...(Object.keys(when).length ? { when } : {}) };
          if (byName.component.has(figma)) {
            addUsage(figma, usage);
            continue;
          }
          const leaves = component.variables.filter((v) => v.name.startsWith(figma + "/")).map((v) => v.name.slice(figma.length + 1));
          const kind = SHADOW_PARTS.every((p) => leaves.includes(p)) ? "shadow"
            : TYPE_PARTS.every((p) => leaves.includes(p)) ? "typography" : null;
          if (!kind) {
            missing.push({ token: dot(figma), ...usage });
            continue;
          }
          if (!composites.has(figma)) {
            composites.set(figma, { name: dot(figma), css: cssVar(figma), kind, members: leaves.map((l) => dot(`${figma}/${l}`)), usedBy: [] });
          }
          composites.get(figma).usedBy.push(usage);
          for (const l of leaves) addUsage(`${figma}/${l}`, { ...usage, via: dot(figma) });
        }
      }
    }
  }

  const prefix = contract.name.toLowerCase() + "/";
  const tokens = component.variables
    .filter((v) => v.name.startsWith(prefix))
    .map((v) => {
      const light = resolve(v.name, MODES.light);
      const dark = resolve(v.name, MODES.dark);
      return {
        name: dot(v.name),
        figma: v.name,
        css: cssVar(v.name),
        type: typeName[v.type],
        references: light.chain[0]?.name ?? null,
        chain: light.chain.map((c) => c.name),
        value: { light: format(light.value, v.name), dark: format(dark.value, v.name) },
        usedBy: usages.get(v.name) ?? [],
      };
    });

  // Text/background pairs per variant and state, from the anatomy's colour tokens.
  const tokenByName = new Map(tokens.map((t) => [t.figma, t]));
  const pairs = [];
  const rootPart = contract.anatomy.root;
  const variants = props.find((p) => p.name === "variant")?.type?.enum ?? [null];
  const one = (ref, variant) => ref && expand(ref, props).find((e) => !e.when.variant || e.when.variant === variant)?.figma;
  for (const variant of variants) {
    const fg = one(rootPart.tokens.color, variant);
    for (const state of ["default", ...Object.keys(rootPart.states ?? {})]) {
      const s = state === "default" ? rootPart.tokens : rootPart.states[state];
      const bgRef = s["background-color"] ?? (state === "default" ? null : undefined);
      if (!bgRef) continue;
      const bg = one(bgRef, variant);
      const fgName = one(s.color, variant) ?? fg;
      const f = tokenByName.get(fgName);
      const b = tokenByName.get(bg);
      if (!f || !b) continue;
      const exempt = state === "disabled";
      const ratio = { light: contrast(f.value.light, b.value.light), dark: contrast(f.value.dark, b.value.dark) };
      pairs.push({
        when: { variant },
        state,
        foreground: f.name,
        background: b.name,
        ratio,
        required: exempt ? null : 4.5,
        pass: exempt ? null : ratio.light >= 4.5 && ratio.dark >= 4.5,
      });
    }
  }
  // Disabled has no variant: keep one entry.
  const deduped = pairs.filter((p, i) => p.state !== "disabled" || pairs.findIndex((q) => q.state === "disabled") === i)
    .map((p) => (p.state === "disabled" ? { ...p, when: {} } : p));

  const referenced = tokens.filter((t) => t.usedBy.length).length;
  return {
    id: `${contract.id}.tokens`,
    component: contract.id,
    name: `${contract.name} tokens`,
    version: contract.version,
    status: contract.status,
    description: `Component-tier tokens that implement ${contract.id}, resolved through the semantic and primitive tiers for each mode.`,
    source: {
      componentContract: relative(root, contractPath),
      tokens: "tokens/figma-variables.json",
      figma: { fileKey: contract.anchors?.figma?.fileKey ?? null, collection: "03 Component" },
      generatedBy: "scripts/build-contracts.mjs",
    },
    modes: Object.keys(MODES),
    tiers: ["component", "semantic", "primitive"],
    tokens,
    composites: [...composites.values()],
    literals,
    contrast: deduped,
    coverage: {
      total: tokens.length,
      referenced,
      unreferenced: tokens.filter((t) => !t.usedBy.length).map((t) => t.name),
      missing,
    },
  };
}

const compDir = join(root, "src/components");
let failed = false;
for (const dir of readdirSync(compDir)) {
  const folder = join(compDir, dir);
  if (!existsSync(folder)) continue;
  for (const f of readdirSync(folder).filter((f) => f.endsWith(".contract.json") && !f.endsWith(".tokens.contract.json"))) {
    const path = join(folder, f);
    const out = buildTokenContract(JSON.parse(readFileSync(path, "utf8")), path);
    const outPath = path.replace(/\.contract\.json$/, ".tokens.contract.json");
    writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
    const { total, referenced, missing } = out.coverage;
    const fails = out.contrast.filter((c) => c.pass === false).length;
    console.log(`${relative(root, outPath)}: ${referenced}/${total} tokens referenced, ${missing.length} missing, ${fails} contrast failures`);
    if (missing.length) failed = true;
  }
}
if (failed) process.exitCode = 1;
