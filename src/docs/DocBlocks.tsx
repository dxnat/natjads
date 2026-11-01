import { useState } from "react";
import { colorRamps, cssVar, resolve, tokens, typeStyles, type Tier } from "./tokens";
import "./docs.css";

function CopyVar({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="docs-var"
      title="Copy var()"
      onClick={() => {
        navigator.clipboard?.writeText(`var(${name})`).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
    >
      {copied ? "Copied" : name}
    </button>
  );
}

const isColor = (v: string) => v.startsWith("#");

function Value({ value }: { value: string }) {
  return (
    <span className="docs-value">
      {isColor(value) && <span className="docs-chip" style={{ background: value }} aria-hidden="true" />}
      <code>{value}</code>
    </span>
  );
}

/** Table of tokens for a tier and name prefix, with alias and resolved Light/Dark values. */
export function TokenTable({ tier = "component", prefix }: { tier?: Tier; prefix: string | string[] }) {
  const rows = tokens(tier, prefix);
  const modes = tier !== "primitive";
  return (
    <div className="docs-table-wrap">
      <table className="docs-table">
        <thead>
          <tr>
            <th>Token</th>
            {tier !== "primitive" && <th>References</th>}
            <th>{modes ? "Light" : "Value"}</th>
            {modes && <th>Dark</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>
                <CopyVar name={r.cssVar} />
              </td>
              {tier !== "primitive" && <td>{r.references ? <code className="docs-ref">{r.references}</code> : "—"}</td>}
              <td>
                <Value value={r.light} />
              </td>
              {modes && <td>{r.modeDependent ? <Value value={r.dark} /> : <span className="docs-same">same</span>}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ColorRamps() {
  return (
    <div className="docs-ramps">
      {colorRamps().map(([hue, steps]) => (
        <div key={hue} className="docs-ramp">
          <div className="docs-ramp__name">{hue}</div>
          <div className="docs-ramp__steps">
            {steps.map((s) => (
              <div key={s.step} className="docs-ramp__step">
                <div className="docs-ramp__swatch" style={{ background: s.hex }} title={s.cssVar} />
                <div className="docs-ramp__label">{s.step}</div>
                <div className="docs-ramp__hex">{s.hex}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TypeSpecimens() {
  return (
    <div className="docs-type">
      {typeStyles().map((style) => {
        const v = cssVar(style);
        const size = resolve(`${style}/font-size`, "semantic").value;
        const lh = resolve(`${style}/line-height`, "semantic").value;
        const weight = resolve(`${style}/weight`, "semantic").value;
        return (
          <div key={style} className="docs-type__row">
            <div className="docs-type__meta">
              <code>.{v.slice(2)}</code>
              <span>
                {size}/{lh} · {weight}
              </span>
            </div>
            <div className={v.slice(2)} style={{ color: "var(--color-neutral-900)" }}>
              The quick brown fox jumps over the lazy dog
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SpacingScale() {
  return (
    <div className="docs-scale">
      {tokens("primitive", "spacing/").map((t) => (
        <div key={t.name} className="docs-scale__row">
          <CopyVar name={t.cssVar} />
          <code className="docs-scale__val">{t.light}</code>
          <div className="docs-scale__bar" style={{ width: `var(${t.cssVar})` }} />
        </div>
      ))}
    </div>
  );
}

export function RadiusScale() {
  return (
    <div className="docs-tiles">
      {tokens("primitive", "radius/").map((t) => (
        <div key={t.name} className="docs-tile">
          <div className="docs-tile__box" style={{ borderRadius: `var(${t.cssVar})` }} />
          <CopyVar name={t.cssVar} />
          <code>{t.light}</code>
        </div>
      ))}
    </div>
  );
}

export function ElevationScale() {
  const levels = ["flat", "raised", "card", "dropdown", "overlay", "modal"];
  return (
    <div className="docs-tiles">
      {levels.map((l) => {
        const name = cssVar(`elevation/${l}`);
        return (
          <div key={l} className="docs-tile">
            <div className="docs-tile__box docs-tile__box--shadow" style={{ boxShadow: `var(${name})` }} />
            <CopyVar name={name} />
          </div>
        );
      })}
    </div>
  );
}
