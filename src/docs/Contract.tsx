import type { ReactNode } from "react";
import "./docs.css";

/* Loose types: contracts are JSON documents, these cover what the views read. */
type Json = Record<string, any>;

const tokenRe = /^\{(.+)\}$/;
const isRef = (v: unknown): v is string => typeof v === "string" && tokenRe.test(v);
/** "{button.{variant}.content}" -> "--button-{variant}-content" */
const refToCss = (ref: string) =>
  "--" + ref.slice(1, -1).split(".").map((s) => (s === "colour" ? "color" : s)).join("-");

function Pill({ tone = "neutral", children }: { tone?: "neutral" | "good" | "warn" | "bad" | "info"; children: ReactNode }) {
  return <span className={`docs-pill docs-pill--${tone}`}>{children}</span>;
}

function Code({ children }: { children: ReactNode }) {
  return <code className="docs-code">{children}</code>;
}

function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="docs-table-wrap">
      <table className="docs-table">
        <thead>
          <tr>{head.map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Value({ value }: { value: string | number }) {
  const v = String(value);
  return (
    <span className="docs-value">
      {v.startsWith("#") && <span className="docs-chip" style={{ background: v }} aria-hidden="true" />}
      <Code>{v}</Code>
    </span>
  );
}

const statusTone = (s: string) => (s === "stable" ? "good" : s === "deprecated" ? "bad" : "warn");

function Header({ c, kind }: { c: Json; kind: string }) {
  return (
    <div className="docs-contract-head">
      <div className="docs-contract-head__row">
        <Pill tone="info">{kind}</Pill>
        <Code>{c.id}</Code>
        <Pill>v{c.version}</Pill>
        <Pill tone={statusTone(c.status)}>{c.status}</Pill>
      </div>
      <p className="docs-contract-head__desc">{c.description}</p>
    </div>
  );
}

function typeLabel(t: any) {
  if (t?.enum) return t.enum.map((v: string) => `"${v}"`).join(" | ");
  return String(t);
}

function Kv({ data }: { data: Record<string, unknown> }) {
  return (
    <dl className="docs-kv">
      {Object.entries(data).map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v === null ? <span className="docs-same">not set</span> : typeof v === "object" ? <Code>{JSON.stringify(v)}</Code> : <Code>{String(v)}</Code>}</dd>
        </div>
      ))}
    </dl>
  );
}

function TokenOrLiteral({ value }: { value: string }) {
  if (!isRef(value)) return <Code>{value}</Code>;
  return (
    <span className="docs-stack">
      <span className="docs-var docs-var--static">{refToCss(value)}</span>
      <span className="docs-ref">{value}</span>
    </span>
  );
}

/* ------------------------------------------------------------------------- */

export function ComponentContract({ contract: c }: { contract: Json }) {
  const root = c.anatomy?.root ?? {};
  return (
    <div className="docs-contract">
      <Header c={c} kind="Component contract" />

      <h2>Semantics</h2>
      <Kv data={{ element: c.semantics.element, role: c.semantics.role, primitive: `${c.semantics.primitive.library} › ${c.semantics.primitive.component}` }} />

      <h2>Props</h2>
      <Table head={["Name", "Type", "Default", "Code", "Figma", "Description"]}>
        {c.props.map((p: Json) => (
          <tr key={p.name}>
            <td><strong>{p.name}</strong></td>
            <td><Code>{typeLabel(p.type)}</Code></td>
            <td><Code>{JSON.stringify(p.default)}</Code></td>
            <td>
              <span className="docs-stack">
                <Code>{p.bindings.code.prop}</Code>
                {p.bindings.code.attribute && <span className="docs-ref">{p.bindings.code.attribute}</span>}
              </span>
            </td>
            <td>
              <span className="docs-stack">
                <span>
                  <Pill>{p.bindings.figma.kind}</Pill> <Code>{p.bindings.figma.property}</Code>
                </span>
                {p.bindings.figma.values && (
                  <span className="docs-ref">
                    {Object.entries(p.bindings.figma.values).map(([k, v]) => `${k} → ${v}`).join(", ")}
                  </span>
                )}
              </span>
            </td>
            <td>{p.description}</td>
          </tr>
        ))}
      </Table>

      {c.events?.length > 0 && (
        <>
          <h2>Events</h2>
          <Table head={["Name", "Code", "Description"]}>
            {c.events.map((e: Json) => (
              <tr key={e.name}>
                <td><strong>{e.name}</strong></td>
                <td><Code>{e.bindings.code.prop}</Code></td>
                <td>{e.description}</td>
              </tr>
            ))}
          </Table>
        </>
      )}

      <h2>Anatomy</h2>
      <p>
        Part <Code>root</Code> · layout{" "}
        {Object.entries(root.layout ?? {}).map(([k, v]) => (
          <span key={k}>
            <Code>{`${k}: ${v}`}</Code>{" "}
          </span>
        ))}
      </p>
      <h3>Base tokens</h3>
      <Table head={["CSS property", "Token"]}>
        {Object.entries(root.tokens ?? {}).map(([prop, ref]) => (
          <tr key={prop}>
            <td><Code>{prop}</Code></td>
            <td><TokenOrLiteral value={ref as string} /></td>
          </tr>
        ))}
      </Table>

      <h3>States</h3>
      <Table head={["State", "Code selector", "CSS property", "Token or value"]}>
        {c.states.flatMap((s: string) => {
          const changes = Object.entries(root.states?.[s] ?? {});
          const attr = c.stateBindings?.[s]?.code?.attribute;
          return (changes.length ? changes : [["—", "—"]]).map(([prop, val], i) => (
            <tr key={`${s}-${prop}`}>
              <td>{i === 0 && <strong>{s}</strong>}</td>
              <td>{i === 0 && attr && <Code>{`[${attr}]`}</Code>}</td>
              <td><Code>{prop}</Code></td>
              <td>{val === "—" ? "—" : <TokenOrLiteral value={val as string} />}</td>
            </tr>
          ));
        })}
      </Table>

      <h3>Parts</h3>
      <Table head={["Part", "Element", "Content / asset", "Visible when", "Description"]}>
        {Object.entries(root.parts ?? {}).map(([name, p]: [string, any]) => (
          <tr key={name}>
            <td><strong>{name}</strong></td>
            <td>{p.element === undefined ? "—" : p.element === null ? <span className="docs-same">none (inline)</span> : <Code>{p.element}</Code>}</td>
            <td>
              {p.content && <Code>{`prop: ${p.content.prop}`}</Code>}
              {p.icon && <Code>{`${p.icon.asset} · ${p.icon.size}`}</Code>}
              {p.animation && <> <Pill>{p.animation}</Pill></>}
            </td>
            <td>{p.visibleWhen ? <Code>{`prop: ${p.visibleWhen.prop}`}</Code> : "always"}</td>
            <td>{p.description ?? ""}</td>
          </tr>
        ))}
      </Table>

      <h2>Accessibility</h2>
      <Kv data={{ focusVisible: c.a11y.focusVisible, minHitArea: `${c.a11y.minHitArea}px`, contrast: c.a11y.contrast, keyboard: c.a11y.keyboard?.join(", ") }} />
      {c.a11y.notes?.length > 0 && (
        <ul className="docs-notes">{c.a11y.notes.map((n: string) => <li key={n}>{n}</li>)}</ul>
      )}

      <h2>Anchors</h2>
      <div className="docs-anchor-grid">
        <div>
          <h3>Figma</h3>
          <Kv data={c.anchors.figma} />
          {!c.anchors.figma.componentSetKey && (
            <p className="docs-callout">No Figma component set yet. Add <Code>componentSetKey</Code> and <Code>nodeId</Code> once the Button component exists in Figma{c.figmaStatePreviews ? "" : ", and set figmaStatePreviews to true when it has state previews"}.</p>
          )}
        </div>
        <div>
          <h3>Code</h3>
          <Kv data={c.anchors.code} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */

function usageLabel(u: Json) {
  const when = u.when ? Object.entries(u.when).map(([k, v]) => `${k}=${v}`).join(" ") : "";
  return [u.part, u.property, u.state !== "default" ? `:${u.state}` : "", when ? `[${when}]` : "", u.via ? `via ${u.via}` : ""]
    .filter(Boolean)
    .join(" ");
}

export function TokenContract({ contract: c }: { contract: Json }) {
  const fails = c.contrast.filter((p: Json) => p.pass === false).length;
  // Group by the first segment after the component name: variant, size, or shared slot.
  const groups = new Map<string, Json[]>();
  const sizes = ["sm", "md", "lg"];
  for (const t of c.tokens) {
    const parts = t.name.split(".");
    const seg = parts.length > 2 ? parts[1] : "shape";
    const key = sizes.includes(seg) ? "size" : seg;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }
  return (
    <div className="docs-contract">
      <Header c={c} kind="Token contract" />

      <div className="docs-stats">
        <div><strong>{c.coverage.total}</strong><span>component tokens</span></div>
        <div><strong>{c.coverage.referenced}/{c.coverage.total}</strong><span>used by the component contract</span></div>
        <div><strong>{c.coverage.missing.length}</strong><span>missing tokens</span></div>
        <div><strong>{fails === 0 ? "AA" : `${fails} fail`}</strong><span>text contrast</span></div>
      </div>

      <h2>Source</h2>
      <Kv data={{ ...c.source, figma: `${c.source.figma.fileKey} › ${c.source.figma.collection}`, modes: c.modes.join(", "), tiers: c.tiers.join(" → ") }} />

      <h2>Tokens</h2>
      <p>Each component token, the contract slot that uses it, its alias chain down to the primitive, and the resolved value per mode.</p>
      {[...groups].map(([group, rows]) => (
        <div key={group}>
          <h3 className="docs-group-title">{group}</h3>
          <Table head={["Token", "Used by", "Alias chain", "Light", "Dark"]}>
            {rows.map((t) => (
              <tr key={t.name}>
                <td>
                  <span className="docs-stack">
                    <span className="docs-var docs-var--static">{t.css}</span>
                    <span className="docs-ref">{t.type}</span>
                  </span>
                </td>
                <td>
                  <span className="docs-stack">
                    {t.usedBy.length ? t.usedBy.map((u: Json, i: number) => <span key={i} className="docs-usage">{usageLabel(u)}</span>) : <Pill tone="warn">unused</Pill>}
                  </span>
                </td>
                <td>
                  <span className="docs-chain">
                    {t.chain.map((n: string, i: number) => (
                      <span key={n}>{i > 0 && <span aria-hidden="true"> → </span>}<Code>{n}</Code></span>
                    ))}
                  </span>
                </td>
                <td><Value value={t.value.light} /></td>
                <td>{t.value.dark === t.value.light ? <span className="docs-same">same</span> : <Value value={t.value.dark} />}</td>
              </tr>
            ))}
          </Table>
        </div>
      ))}

      {c.composites.length > 0 && (
        <>
          <h2>Composites</h2>
          <Table head={["Composite", "Kind", "Members", "Used by"]}>
            {c.composites.map((x: Json) => (
              <tr key={x.name}>
                <td><span className="docs-var docs-var--static">{x.css}</span></td>
                <td><Pill>{x.kind}</Pill></td>
                <td><span className="docs-stack">{x.members.map((m: string) => <Code key={m}>{m}</Code>)}</span></td>
                <td>{x.usedBy.map((u: Json) => usageLabel(u)).join(", ")}</td>
              </tr>
            ))}
          </Table>
        </>
      )}

      {c.literals.length > 0 && (
        <>
          <h2>Hard-coded values</h2>
          <p>These values in the component contract have no token. Candidates for new tokens:</p>
          <Table head={["Part", "State", "CSS property", "Value"]}>
            {c.literals.map((l: Json) => (
              <tr key={`${l.state}-${l.property}`}>
                <td><Code>{l.part}</Code></td>
                <td>{l.state}</td>
                <td><Code>{l.property}</Code></td>
                <td><Code>{l.value}</Code></td>
              </tr>
            ))}
          </Table>
        </>
      )}

      <h2>Contrast</h2>
      <p>Text against background for every variant and state, in both modes. WCAG AA requires 4.5:1; disabled controls are exempt.</p>
      <Table head={["Variant", "State", "Foreground", "Background", "Light", "Dark", "Result"]}>
        {c.contrast.map((p: Json) => (
          <tr key={`${p.when.variant}-${p.state}`}>
            <td>{p.when.variant ?? <span className="docs-same">all</span>}</td>
            <td>{p.state}</td>
            <td><Code>{p.foreground}</Code></td>
            <td><Code>{p.background}</Code></td>
            <td><Code>{p.ratio.light.toFixed(2)}:1</Code></td>
            <td><Code>{p.ratio.dark.toFixed(2)}:1</Code></td>
            <td>{p.pass === null ? <Pill>exempt</Pill> : p.pass ? <Pill tone="good">AA pass</Pill> : <Pill tone="bad">fail</Pill>}</td>
          </tr>
        ))}
      </Table>

      <h2>Coverage</h2>
      <Kv data={{ unreferenced: c.coverage.unreferenced.length ? c.coverage.unreferenced.join(", ") : "none", missing: c.coverage.missing.length ? c.coverage.missing.map((m: Json) => m.token).join(", ") : "none" }} />
    </div>
  );
}
