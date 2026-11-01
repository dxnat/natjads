// Reads tokens/figma-variables.json so the docs always match the generated CSS.
import source from "../../tokens/figma-variables.json";

type Alias = { alias: string };
type RawValue = string | number | Alias;
export type TokenType = "COLOR" | "FLOAT" | "STRING";

interface RawVariable {
  name: string;
  type: TokenType;
  values: Record<string, RawValue>;
}

interface RawCollection {
  name: string;
  modes: string[];
  variables: RawVariable[];
}

export type Tier = "primitive" | "semantic" | "component";
export type Mode = "Light" | "Dark";

const [primitives, semantic, component] = (source as { collections: RawCollection[] }).collections;
const tiers: Record<Tier, RawCollection> = { primitive: primitives, semantic, component };
const order: Tier[] = ["component", "semantic", "primitive"];
const index = new Map<Tier, Map<string, RawVariable>>(
  order.map((t) => [t, new Map(tiers[t].variables.map((v) => [v.name, v]))]),
);

const isAlias = (v: RawValue): v is Alias => typeof v === "object" && v !== null && "alias" in v;

/** Figma path -> CSS custom property, mirroring scripts/build-tokens.mjs. */
export const cssVar = (path: string) =>
  "--" + path.split("/").map((s) => (s === "colour" ? "color" : s)).join("-");

function rawValue(tier: Tier, v: RawVariable, mode: Mode): RawValue {
  return tier === "semantic" ? v.values[mode] : v.values.Base;
}

/** Follows aliases down the tiers; returns the chain of names and the final literal. */
export function resolve(name: string, tier: Tier, mode: Mode = "Light") {
  const chain: string[] = [];
  let current: RawVariable | undefined = index.get(tier)!.get(name);
  let currentTier = tier;
  while (current) {
    const value = rawValue(currentTier, current, mode);
    if (!isAlias(value)) return { chain, value, type: current.type };
    chain.push(value.alias);
    const next = order.slice(order.indexOf(currentTier) + 1).find((t) => index.get(t)!.has(value.alias));
    if (!next) break;
    currentTier = next;
    current = index.get(next)!.get(value.alias);
  }
  return { chain, value: undefined, type: current?.type };
}

export function format(value: RawValue | undefined, type: TokenType | undefined, name: string) {
  if (value === undefined || isAlias(value)) return "—";
  if (type === "FLOAT") return name.includes("weight") || value === 0 ? String(value) : `${value}px`;
  return String(value);
}

export interface TokenRow {
  name: string;
  cssVar: string;
  type: TokenType;
  references?: string;
  light: string;
  dark: string;
  modeDependent: boolean;
}

export function tokens(tier: Tier, prefix: string | string[] = ""): TokenRow[] {
  const prefixes = Array.isArray(prefix) ? prefix : [prefix];
  return tiers[tier].variables
    .filter((v) => prefixes.some((p) => v.name.startsWith(p)))
    .map((v) => {
      const light = resolve(v.name, tier, "Light");
      const dark = resolve(v.name, tier, "Dark");
      const first = rawValue(tier, v, "Light");
      const l = format(light.value, light.type, v.name);
      const d = format(dark.value, dark.type, v.name);
      return {
        name: v.name,
        cssVar: cssVar(v.name),
        type: v.type,
        references: isAlias(first) ? cssVar(first.alias) : undefined,
        light: l,
        dark: d,
        modeDependent: l !== d,
      };
    });
}

/** Primitive colour ramps grouped by hue, e.g. { orange: [{ step: "50", hex }] }. */
export function colorRamps() {
  const ramps = new Map<string, { step: string; hex: string; cssVar: string }[]>();
  for (const v of primitives.variables) {
    const [root, hue, step] = v.name.split("/");
    if (root !== "colour" || !step) continue;
    if (!ramps.has(hue)) ramps.set(hue, []);
    ramps.get(hue)!.push({ step, hex: String(v.values.Base), cssVar: cssVar(v.name) });
  }
  return [...ramps];
}

/** Names of semantic type styles, e.g. "type/body/md". */
export function typeStyles() {
  return semantic.variables
    .filter((v) => v.name.startsWith("type/") && v.name.endsWith("/family"))
    .map((v) => v.name.replace(/\/family$/, ""));
}
