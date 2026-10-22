import "./shared";
import data from "../data/evidence.json";
import { tableMeanings } from "../data/presentation.mjs";
const tableDescriptions: Record<string, string> = tableMeanings;
type Kind =
  | "person"
  | "system"
  | "external"
  | "container"
  | "store"
  | "component"
  | "agent"
  | "code";
type Detail = {
  c4: Kind;
  title: string;
  type: string;
  sub: string;
  description: string;
  inputs: string[];
  outputs: string[];
  sources: string[];
  storage?: string;
};
type Box = { id: string; x: number; y: number; w?: number; h?: number };
type Edge = {
  from: string;
  to: string;
  label: string;
  tech: string;
  optional?: boolean;
  route?: "h" | "v";
  via?: [number, number][];
};
type Graph = {
  level: string;
  focus?: string;
  title: string;
  caption: string;
  width: number;
  height: number;
  boundaries?: {
    label: string;
    sub: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }[];
  nodes: Box[];
  edges: Edge[];
};
const nodes = data.nodes as Record<string, Detail>;
const graphs = data.diagrams as unknown as Record<string, Graph>;
const sources = data.sources as Record<
  string,
  {
    id: string;
    path: string;
    start: number;
    end: number;
    title: string;
    sha256: string;
    excerpt: string;
  }
>;
const $ = <T extends Element = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
const $$ = <T extends Element = HTMLElement>(selector: string) =>
  Array.from(document.querySelectorAll<T>(selector));
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const sourceLinks = (ids: string[]) =>
  `<div class="source-links">${ids.map((id) => `<button type="button" data-source="${id}"><span aria-hidden="true">↗</span> ${esc(sources[id].title)}</button>`).join("")}</div>`;

const levels = ["context", "containers", "components", "code"];
const levelGraphs = (lvl: string) =>
  Object.keys(graphs).filter((k) => graphs[k].level === lvl);
let level = "context",
  selected = "system",
  zoom = 1,
  panX = 0,
  panY = 0;
const focusByLevel: Record<string, string> = {
  components: "cycle",
  code: "code",
};
const svg = $<SVGSVGElement>("#diagram-svg");
const content = $<SVGGElement>("#diagram-content");
const graphKey = () => focusByLevel[level] ?? levelGraphs(level)[0];
const graph = () => graphs[graphKey()];

function wrapText(text: string, max: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && (line + " " + word).length > max) {
      lines.push(line);
      line = word;
    } else line += (line ? " " : "") + word;
  }
  if (line) lines.push(line);
  return lines;
}

// C4 notation: people dark blue, the system blue, containers mid blue,
// components light blue, externals grey; model-driven roles are amber.
const diagramCss = `
.c4-node{cursor:pointer}
.c4-node .shape{stroke-width:1.5}
.c4-node text{font-family:"IBM Plex Sans",Arial,sans-serif;pointer-events:none;text-anchor:middle}
.c4-node .t-title{font-size:18px;font-weight:600}
.c4-node .t-type{font-size:13px;opacity:.88}
.c4-node .t-sub{font-size:13.5px}
.k-person .shape{fill:#08427b;stroke:#052e56}.k-person text{fill:#fff}
.k-system .shape{fill:#1168bd;stroke:#0b4884}.k-system text{fill:#fff}
.k-external .shape{fill:#8a8f94;stroke:#6b7075}.k-external text{fill:#fff}
.k-container .shape{fill:#438dd5;stroke:#2e6295}.k-container text{fill:#fff}
.k-store .shape{fill:#438dd5;stroke:#2e6295}.k-store text{fill:#fff}
.k-component .shape{fill:#85bbf0;stroke:#5d82a8}.k-component text{fill:#0b2340}
.k-agent .shape{fill:#f4c27f;stroke:#b7792b}.k-agent text{fill:#3d2408}
.k-code .shape{fill:#fffefa;stroke:#5d82a8}.k-code .band{fill:#dbe8f6}.k-code text{fill:#0b2340}
.c4-node.selected .shape{stroke:#f2a516;stroke-width:4}
.c4-node:focus{outline:none}.c4-node:focus .shape{stroke:#f2a516;stroke-width:4}
.c4-edge path{fill:none;stroke:#6f7680;stroke-width:1.5;marker-end:url(#arrow)}
.c4-edge.optional path{stroke-dasharray:6 5}
.c4-edge.active path{stroke:#0b4884;stroke-width:2.4}
.c4-edge .l-bg{fill:#f6f7f4;opacity:.94}
.c4-edge text{font-family:"IBM Plex Sans",Arial,sans-serif;text-anchor:middle;fill:#2c3238}
.c4-edge .l-main{font-size:12.5px;font-weight:500}.c4-edge .l-tech{font-size:11px;fill:#5e6670}
.c4-edge.active text{fill:#0b4884}
.c4-boundary rect{fill:none;stroke:#7b8590;stroke-width:1.4;stroke-dasharray:8 6}
.c4-boundary text{font-family:"IBM Plex Sans",Arial,sans-serif;fill:#3f4850}
.c4-boundary .b-title{font-size:14px;font-weight:600}.c4-boundary .b-sub{font-size:12px}
`;
const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
style.textContent = diagramCss;
svg.insertBefore(style, svg.firstChild);

const size = (n: Box) => ({
  w: n.w ?? 240,
  h: n.h ?? 140,
});
const typeLine = (d: Detail) =>
  "[" + d.type.replace(/^(Компонент|Контейнер|Код) · /, "") + "]";

function shapeMarkup(d: Detail, w: number, h: number) {
  if (d.c4 === "person")
    return `<circle class="shape" cx="${w / 2}" cy="22" r="22"/><rect class="shape" y="36" width="${w}" height="${h - 36}" rx="26"/>`;
  if (d.c4 === "store")
    return `<path class="shape" d="M0 14 A${w / 2} 14 0 0 1 ${w} 14 V${h - 14} A${w / 2} 14 0 0 1 0 ${h - 14} Z"/><path class="shape" d="M0 14 A${w / 2} 14 0 0 0 ${w} 14" fill="none"/>`;
  if (d.c4 === "code")
    return `<rect class="shape" width="${w}" height="${h}" rx="3"/><rect class="band" x="1" y="1" width="${w - 2}" height="44"/>`;
  return `<rect class="shape" width="${w}" height="${h}" rx="${d.c4 === "system" || d.c4 === "external" ? 8 : 6}"/>`;
}

function nodeMarkup(n: Box) {
  const d = nodes[n.id],
    { w, h } = size(n);
  const top = d.c4 === "person" ? 52 : d.c4 === "store" ? 34 : 24;
  const title = wrapText(d.title, Math.floor(w / 10.6));
  const sub = wrapText(d.sub, Math.floor(w / 7.6)).slice(0, 2);
  let y = top + 4;
  const lines = [
    ...title.map((t) => {
      y += 20;
      return `<text class="t-title" x="${w / 2}" y="${y}">${esc(t)}</text>`;
    }),
    (() => {
      y += 18;
      return `<text class="t-type" x="${w / 2}" y="${y}">${esc(typeLine(d))}</text>`;
    })(),
    ...sub.map((t, i) => {
      y += i ? 16 : 21;
      return `<text class="t-sub" x="${w / 2}" y="${y}">${esc(t)}</text>`;
    }),
  ];
  return `<g class="c4-node k-${d.c4} ${n.id === selected ? "selected" : ""}" transform="translate(${n.x},${n.y})" role="button" tabindex="0" aria-label="${esc(d.title)}: ${esc(d.type)}" aria-pressed="${n.id === selected}" data-node="${n.id}">${shapeMarkup(d, w, h)}${lines.join("")}</g>`;
}

type Side = "top" | "bottom" | "left" | "right";
type Rect = { x: number; y: number; w: number; h: number };
const rectOf = (n: Box): Rect => ({ x: n.x, y: n.y, ...size(n) });
const cx = (r: Rect) => r.x + r.w / 2;
const cy = (r: Rect) => r.y + r.h / 2;

// Edges between neighbours in a row or column run straight along the shared
// centre line; others leave a side with an offset towards their target.
function plan(g: Graph) {
  const byId = Object.fromEntries(g.nodes.map((n) => [n.id, rectOf(n)]));
  type Leg = { side: Side; other: number; edge: number; end: "a" | "b" };
  const legs: Record<string, Leg[]> = {};
  const routes = g.edges.map((e, i) => {
    const a = byId[e.from],
      b = byId[e.to];
    if (e.via) return { kind: "via" as const, a, b };
    const sameRow = Math.abs(cy(a) - cy(b)) < 2,
      sameCol = Math.abs(cx(a) - cx(b)) < 2;
    if (sameRow || sameCol) return { kind: "straight" as const, a, b, sameRow };
    const vertical = e.route !== "h";
    const sa: Side = vertical
      ? cy(b) > cy(a)
        ? "bottom"
        : "top"
      : cx(b) > cx(a)
        ? "right"
        : "left";
    const sb: Side = vertical
      ? cy(b) > cy(a)
        ? "top"
        : "bottom"
      : cx(b) > cx(a)
        ? "left"
        : "right";
    (legs[e.from + sa] ??= []).push({
      side: sa,
      other: vertical ? cx(b) : cy(b),
      edge: i,
      end: "a",
    });
    (legs[e.to + sb] ??= []).push({
      side: sb,
      other: vertical ? cx(a) : cy(a),
      edge: i,
      end: "b",
    });
    return { kind: "elbow" as const, a, b, vertical, sa, sb };
  });
  const offsets: Record<string, number> = {};
  for (const [key, list] of Object.entries(legs)) {
    const id = key.replace(/(top|bottom|left|right)$/, "");
    const r = byId[id],
      side = list[0].side;
    const centre = side === "top" || side === "bottom" ? cx(r) : cy(r);
    const before = list
      .filter((l) => l.other < centre)
      .sort((p, q) => q.other - p.other);
    const after = list
      .filter((l) => l.other >= centre)
      .sort((p, q) => p.other - q.other);
    before.forEach((l, k) => (offsets[l.edge + l.end] = centre - 40 * (k + 1)));
    after.forEach((l, k) => (offsets[l.edge + l.end] = centre + 40 * (k + 1)));
  }
  return routes.map((r, i) => {
    const e = g.edges[i];
    let pts: [number, number][];
    if (r.kind === "via") {
      const toward = (rc: Rect, [px, py]: [number, number]): [number, number] =>
        px > rc.x + rc.w
          ? [rc.x + rc.w, py]
          : px < rc.x
            ? [rc.x, py]
            : py < rc.y
              ? [px, rc.y]
              : [px, rc.y + rc.h];
      const via = e.via!;
      pts = [toward(r.a, via[0]), ...via, toward(r.b, via[via.length - 1])];
    } else if (r.kind === "straight") {
      const { a, b } = r;
      if (r.sameRow) {
        const y = cy(a),
          fw = cx(b) > cx(a);
        pts = [
          [fw ? a.x + a.w : a.x, y],
          [fw ? b.x : b.x + b.w, y],
        ];
      } else {
        const x = cx(a),
          dn = cy(b) > cy(a);
        pts = [
          [x, dn ? a.y + a.h : a.y],
          [x, dn ? b.y : b.y + b.h],
        ];
      }
    } else {
      const { a, b, vertical, sa, sb } = r;
      const pa = offsets[i + "a"],
        pb = offsets[i + "b"];
      if (vertical) {
        const ya = sa === "bottom" ? a.y + a.h : a.y,
          yb = sb === "top" ? b.y : b.y + b.h,
          mid = (ya + yb) / 2;
        pts = [
          [pa, ya],
          [pa, mid],
          [pb, mid],
          [pb, yb],
        ];
      } else {
        const xa = sa === "right" ? a.x + a.w : a.x,
          xb = sb === "left" ? b.x : b.x + b.w,
          mid = (xa + xb) / 2;
        pts = [
          [xa, pa],
          [mid, pa],
          [mid, pb],
          [xb, pb],
        ];
      }
    }
    // Label on the longest segment.
    let best = 0,
      lx = 0,
      ly = 0;
    for (let k = 1; k < pts.length; k++) {
      const len = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
      if (len > best) {
        best = len;
        lx = (pts[k][0] + pts[k - 1][0]) / 2;
        ly = (pts[k][1] + pts[k - 1][1]) / 2;
      }
    }
    return { pts, lx, ly };
  });
}

function edgeMarkup(e: Edge, r: { pts: [number, number][]; lx: number; ly: number }) {
  const d = "M" + r.pts.map(([x, y]) => `${x} ${y}`).join(" L");
  const tech = e.tech ? `[${e.tech}]` : "";
  const wide = Math.max(e.label.length * 6.9, tech.length * 6.1) + 14;
  const tall = tech ? 34 : 20;
  const active = e.from === selected || e.to === selected;
  return `<g class="c4-edge ${e.optional ? "optional" : ""} ${active ? "active" : ""}"><path d="${d}"/>${
    e.label
      ? `<rect class="l-bg" x="${r.lx - wide / 2}" y="${r.ly - tall / 2}" width="${wide}" height="${tall}" rx="3"/><text class="l-main" x="${r.lx}" y="${r.ly + (tech ? -3 : 4)}">${esc(e.label)}</text>${tech ? `<text class="l-tech" x="${r.lx}" y="${r.ly + 12}">${esc(tech)}</text>` : ""}`
      : ""
  }</g>`;
}

function renderFocus() {
  const keys = levelGraphs(level);
  const box = $("#component-selector");
  box.hidden = keys.length < 2;
  box.innerHTML =
    `<span>Фокус:</span>` +
    keys
      .map(
        (k) =>
          `<button type="button" data-focus="${k}" aria-pressed="${k === graphKey()}">${esc(graphs[k].focus ?? k)}</button>`,
      )
      .join("");
}

function renderDiagram() {
  const g = graph();
  if (!g.nodes.some((n) => n.id === selected)) selected = g.nodes[0].id;
  $("#diagram-title").textContent = g.title;
  $("#diagram-counter").textContent = `C${levels.indexOf(level) + 1} / 4`;
  $("#diagram-caption").textContent = g.caption;
  $("#diagram-panel").setAttribute("aria-labelledby", "tab-" + level);
  svg.setAttribute("viewBox", `0 0 ${g.width} ${g.height}`);
  svg.setAttribute("aria-label", g.title + ". Блоки можно выбрать клавишей Enter.");
  const boundaries = (g.boundaries ?? [])
    .map(
      (bd) =>
        `<g class="c4-boundary"><rect x="${bd.x}" y="${bd.y}" width="${bd.w}" height="${bd.h}" rx="10"/><text class="b-title" x="${bd.x + 16}" y="${bd.y + bd.h - 30}">${esc(bd.label)}</text><text class="b-sub" x="${bd.x + 16}" y="${bd.y + bd.h - 12}">[${esc(bd.sub)}]</text></g>`,
    )
    .join("");
  const routes = plan(g);
  content.innerHTML =
    boundaries +
    g.edges.map((e, i) => edgeMarkup(e, routes[i])).join("") +
    g.nodes.map(nodeMarkup).join("");
  $("#node-index").innerHTML = g.nodes
    .map(
      (n) =>
        `<button data-node="${n.id}" aria-pressed="${n.id === selected}">${esc(nodes[n.id].title)}</button>`,
    )
    .join("");
  renderInspector();
  updateTransform();
  $$("[data-level]").forEach((b) => {
    b.setAttribute("aria-selected", String(b.dataset.level === level));
    b.tabIndex = b.dataset.level === level ? 0 : -1;
  });
  renderFocus();
}
function renderInspector() {
  const d = nodes[selected];
  $("#inspector").innerHTML =
    `<p class="eyebrow">${esc(d.type)}</p><h3>${esc(d.title)}</h3><p class="inspector-description">${esc(d.description)}</p><dl><dt>НА ВХОДЕ</dt>${d.inputs.map((s) => `<dd>${esc(s)}</dd>`).join("")}<dt>НА ВЫХОДЕ</dt>${d.outputs.map((s) => `<dd>${esc(s)}</dd>`).join("")}</dl>${d.storage ? `<p class="storage-ref">${esc(d.storage)}</p>` : ""}<p class="eyebrow" style="margin:22px 0 0">ОСНОВАНИЕ В КОДЕ</p>${sourceLinks(d.sources)}`;
}
function updateTransform() {
  const g = graph();
  const mx = g.width / 2,
    my = g.height / 2;
  content.setAttribute(
    "transform",
    `translate(${panX} ${panY}) translate(${mx} ${my}) scale(${zoom}) translate(${-mx} ${-my})`,
  );
  $("#zoom-label").textContent = Math.round(zoom * 100) + "%";
  $("#zoom-out").toggleAttribute("disabled", zoom <= 0.6);
  $("#zoom-in").toggleAttribute("disabled", zoom >= 2.4);
}
function resetView() {
  zoom = 1;
  panX = 0;
  panY = 0;
  updateTransform();
}
let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) {
  $("#toast").textContent = message;
  $("#toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("#toast").hidden = true), 3200);
}
function updateUrl() {
  const hash = "c4=" + graphKey() + "&node=" + selected;
  history.replaceState(null, "", "#" + hash);
}
document.addEventListener("click", (e) => {
  const target = (e.target as Element).closest<HTMLElement>(
    "[data-node],[data-level],[data-focus],[data-source]",
  );
  if (!target) return;
  if (target.dataset.node) {
    selected = target.dataset.node;
    renderDiagram();
    updateUrl();
  }
  if (target.dataset.level) {
    level = target.dataset.level;
    resetView();
    renderDiagram();
    updateUrl();
  }
  if (target.dataset.focus) {
    focusByLevel[level] = target.dataset.focus;
    resetView();
    renderDiagram();
    updateUrl();
  }
  if (target.dataset.source) openSource(target.dataset.source);
});
svg.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    const n = (e.target as Element).closest("[data-node]");
    if (n) {
      e.preventDefault();
      selected = n.getAttribute("data-node")!;
      renderDiagram();
      updateUrl();
      svg.querySelector<SVGGElement>(`[data-node="${selected}"]`)?.focus();
    }
  }
});
let drag: { x: number; y: number; px: number; py: number } | null = null;
svg.addEventListener("pointerdown", (e) => {
  if ((e.target as Element).closest("[data-node]")) return;
  drag = { x: e.clientX, y: e.clientY, px: panX, py: panY };
  svg.setPointerCapture(e.pointerId);
});
svg.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const scale = graph().width / svg.getBoundingClientRect().width;
  panX = drag.px + (e.clientX - drag.x) * scale;
  panY = drag.py + (e.clientY - drag.y) * scale;
  updateTransform();
});
svg.addEventListener("pointerup", () => (drag = null));
svg.addEventListener("pointercancel", () => (drag = null));
$("#zoom-in").addEventListener("click", () => {
  zoom = Math.min(2.4, Math.round((zoom + 0.2) * 10) / 10);
  updateTransform();
});
$("#zoom-out").addEventListener("click", () => {
  zoom = Math.max(0.6, Math.round((zoom - 0.2) * 10) / 10);
  updateTransform();
});
$("#zoom-fit").addEventListener("click", resetView);
let expanded = false;
function expandAtlas(value: boolean) {
  expanded = value;
  $("#atlas").classList.toggle("expanded", value);
  document.body.classList.toggle("atlas-open", value);
  $("#fullscreen").setAttribute(
    "aria-label",
    value ? "Свернуть схему" : "Схема на весь экран",
  );
  $("#fullscreen").setAttribute("aria-expanded", String(value));
  $("#fullscreen").textContent = value ? "×" : "⤢";
  if (value) {
    $("#atlas").setAttribute("role", "dialog");
    $("#atlas").setAttribute("aria-modal", "true");
    $("#atlas").setAttribute("aria-label", "Интерактивная C4-диаграмма");
  } else {
    ["role", "aria-modal", "aria-label"].forEach((a) =>
      $("#atlas").removeAttribute(a),
    );
  }
  $("#fullscreen").focus();
}
$("#fullscreen").addEventListener("click", () => expandAtlas(!expanded));
document.addEventListener("keydown", (e) => {
  if (!expanded || $<HTMLDialogElement>("#source-dialog").open) return;
  if (e.key === "Escape") {
    e.preventDefault();
    expandAtlas(false);
  }
  if (e.key === "Tab") {
    const candidates = Array.from(
      $("#atlas").querySelectorAll<HTMLElement>(
        'button:not([disabled]),a,[tabindex="0"]',
      ),
    ).filter((el) => el.getClientRects().length > 0);
    const first = candidates[0],
      last = candidates[candidates.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$("#download-svg").addEventListener("click", () => {
  const g = graph();
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(g.width));
  clone.setAttribute("height", String(g.height));
  clone.querySelector("#diagram-content")?.removeAttribute("transform");
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", String(g.width));
  rect.setAttribute("height", String(g.height));
  rect.setAttribute("fill", "#f6f7f4");
  clone.insertBefore(rect, clone.firstChild);
  download(
    new Blob([new XMLSerializer().serializeToString(clone)], {
      type: "image/svg+xml;charset=utf-8",
    }),
    "c4-" + graphKey() + ".svg",
  );
  toast("Схема сохранена в SVG");
});
$("#share-diagram").addEventListener("click", async () => {
  updateUrl();
  try {
    await navigator.clipboard.writeText(location.href);
    toast("Ссылка на выбранный блок скопирована");
  } catch {
    toast("Ссылка на выбранный блок находится в адресной строке");
  }
});

let storage = "passport";
const tables = data.tables as Record<
  string,
  {
    name: string;
    path: string;
    line: number;
    fields: {
      name: string;
      type: string;
      primary: boolean;
      nullable: boolean;
      foreign: string | null;
    }[];
  }
>;
function renderStorage() {
  const g = data.storageGroups.find((g) => g.id === storage)!;
  $("#storage-name").textContent = g.name;
  $("#storage-description").textContent = g.text;
  $("#storage-path").textContent = g.path;
  $("#storage-sources").innerHTML = sourceLinks(g.sources);
  $("#storage-panel").setAttribute("aria-labelledby", "storage-tab-" + storage);
  if (storage === "passport") {
    const fields = [
      "schema_version",
      "passport_id",
      "document_id",
      "page_no",
      "coordinate_system",
      "title_block",
      "general_technical_data",
      "part_name",
      "drawing_designation",
      "part_class",
      "material",
      "scale",
      "drawing_mass",
      "quality_control_ids",
      "drawing_quantity",
      "envelope",
      "dimensions",
      "geometry_relations",
      "features",
      "geometry_description",
      "geometry_mentions",
      "views",
      "roughness",
      "general_tolerances",
      "standard_references",
      "stock_prescriptions",
      "normative_references_checked",
      "technical_requirements_checked",
      "technical_requirements",
      "local_reference_definitions",
      "local_reference_uses",
      "source_conflicts",
      "unmapped_facts",
      "status",
      "revision",
    ];
    const rows = [
      "Наружный диаметр",
      "Внутренний диаметр",
      "Линейный размер",
      "Радиус",
      "Угол",
      "Толщина",
      "Размер",
    ];
    $("#storage-content").innerHTML =
      `<div class="passport-explainer"><h4>Вложенный JSON DrawingPassport v2</h4><p>Ниже — поля контракта, а не значения конкретного чертежа. Числа, не прочитанные на источнике, остаются null со статусом.</p><div class="passport-fields">${fields.map((f) => `<code>${f}</code>`).join("")}</div><h4>Как представлена таблица для технолога</h4><p>Пять видимых колонок. Заголовок первой колонки в контракте пустой; ниже он подписан «Элемент» для пояснения. Типы строк показаны без вымышленных размерных значений.</p><div class="table-scroll"><table><thead><tr><th>Элемент</th><th>Размер</th><th>Допуск</th><th>Шероховатость</th><th>Связанные размеры</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${r}</td><td><code>raw_text</code><br/>или nominal</td><td>Буквальный /<br/>поддержанный</td><td>Локальная /<br/>общая</td><td>Ссылки по<br/>features / relations</td></tr>`).join("")}</tbody></table></div><div class="row-details">Одна строка на <code>dimensions[i]</code> → <code>row_id = dimension:{id}</code>. Помимо отображаемых колонок, строка содержит <code>dimension_refs</code>, <code>feature_refs</code>, <code>relation_refs</code> и <code>evidence_refs</code>. Размер отверстия и неподтверждённая принадлежность диаметра получают отдельные подписи. Число строк зависит от распознанного листа.</div>${sourceLinks(["passport", "projection", "projectionRows", "evidence"])}</div>`;
  } else {
    $("#storage-content").innerHTML =
      `<div class="schema-browser"><div class="schema-list" aria-label="Таблицы"><span>ТАБЛИЦЫ / ${g.tables.length}</span>${g.tables.map((t, i) => `<button data-table="${t}" aria-pressed="${i === 0}">${t}</button>`).join("")}</div><div class="schema-detail" id="schema-detail"></div></div>`;
    renderTable(g.tables[0]);
  }
  $$("[data-storage]").forEach((b) => {
    const active = b.dataset.storage === storage;
    b.setAttribute("aria-selected", String(active));
    b.tabIndex = active ? 0 : -1;
  });
}
function renderTable(id: string) {
  const t = tables[id];
  $("#schema-detail").innerHTML =
    `<div class="schema-title"><h4>${esc(t.name)}</h4><span>${t.fields.length} ПОЛЕЙ</span></div><p class="table-meaning">${esc(tableDescriptions[id] || "")}</p><div class="table-scroll"><table><thead><tr><th>Поле</th><th>Тип в схеме</th><th>Можно оставить пустым</th><th>Ключ / связь</th></tr></thead><tbody>${t.fields.map((f) => `<tr><td><code>${esc(f.name)}</code></td><td>${esc(f.type)}</td><td>${f.nullable ? "Да" : "Нет"}</td><td>${f.primary ? '<span class="key-tag">PK</span> ' : ""}${f.foreign ? `<code>→ ${esc(f.foreign)}</code>` : ""}</td></tr>`).join("")}</tbody></table></div><p>Источник: ${esc(t.path)}:${t.line}. Типы указаны как в объявлении SQLAlchemy / SQLite; NULL означает допустимость пустого значения; PK — идентификатор записи.</p>`;
  $$("[data-table]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.table === id)),
  );
}
$$("[data-storage]").forEach((b) =>
  b.addEventListener("click", () => {
    storage = b.dataset.storage!;
    renderStorage();
  }),
);
document.addEventListener("click", (e) => {
  const t = (e.target as Element).closest<HTMLElement>("[data-table]");
  if (t) renderTable(t.dataset.table!);
});
const dialog = $<HTMLDialogElement>("#source-dialog");
let lastSourceTrigger: HTMLElement | null = null;
function openSource(id: string) {
  const s = sources[id];
  if (!s) return;
  lastSourceTrigger = document.activeElement as HTMLElement;
  $("#source-dialog-title").textContent = s.title;
  $("#source-dialog-path").textContent = `${s.path}:${s.start}–${s.end}`;
  $("#source-dialog-hash").textContent = s.sha256;
  $("#source-dialog-code").textContent = s.excerpt
    .split("\n")
    .map((l, i) => String(s.start + i).padStart(4, " ") + "  " + l)
    .join("\n");
  dialog.showModal();
  $("#close-source").focus();
}
$("#close-source").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }
});
dialog.addEventListener("close", () => lastSourceTrigger?.focus());
const query = $<HTMLInputElement>("#source-query");
let sourcesExpanded = false;
function filterSources() {
  const q = query.value.trim().toLowerCase();
  let count = 0,
    shown = 0;
  $$(".source-entry").forEach((e) => {
    const matches = e.dataset.search!.includes(q);
    if (matches) count++;
    e.hidden = !matches || (!q && !sourcesExpanded && count > 8);
    if (!e.hidden) shown++;
  });
  $("#source-result-count").textContent = q
    ? `${count} / ${Object.keys(sources).length} ФРАГМЕНТОВ`
    : `ПОКАЗАНО ${shown} ИЗ ${Object.keys(sources).length} ФРАГМЕНТОВ`;
  $("#source-empty").hidden = count > 0;
  $("#expand-sources").hidden = !!q;
  $("#expand-sources").setAttribute("aria-expanded", String(sourcesExpanded));
  $("#expand-sources").textContent = sourcesExpanded
    ? "Свернуть основания ↑"
    : "Показать все основания ↓";
}
$("#expand-sources").addEventListener("click", () => {
  sourcesExpanded = !sourcesExpanded;
  filterSources();
});
query.addEventListener("input", filterSources);
$("#print-page").addEventListener("click", () => window.print());
function restoreUrl() {
  const hash = location.hash.slice(1);
  if (!hash.startsWith("c4=")) return;
  const params = new URLSearchParams(hash),
    key = params.get("c4");
  if (key && graphs[key]) {
    level = graphs[key].level;
    if (levelGraphs(level).length > 1) focusByLevel[level] = key;
    const node = params.get("node");
    if (node && graphs[key].nodes.some((n) => n.id === node)) selected = node;
    resetView();
    renderDiagram();
    const architecture = $<HTMLDetailsElement>("#architecture");
    architecture.open = true;
    architecture.scrollIntoView({ behavior: "instant" });
  }
}
renderDiagram();
renderStorage();
filterSources();
restoreUrl();
window.addEventListener("hashchange", restoreUrl);
