import "./shared";
import data from "../data/evidence.json";
import { tableMeanings } from "../data/presentation.mjs";
const tableDescriptions: Record<string, string> = tableMeanings;
type Detail = {
  title: string;
  type: string;
  sub: string;
  description: string;
  inputs: string[];
  outputs: string[];
  sources: string[];
  storage?: string;
};
type Graph = {
  title: string;
  caption: string;
  nodes: { id: string; x: number; y: number }[];
  edges: { from: string; to: string; label: string; optional: boolean }[];
  boundary?: string;
  note?: string;
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
let level = "context",
  focus = "recognition",
  selected = "system",
  zoom = 1,
  panX = 0,
  panY = 0;
const svg = $<SVGSVGElement>("#diagram-svg");
const content = $<SVGGElement>("#diagram-content");
const graphKey = () => (level === "components" ? focus : level);
function wrapText(text: string, max = 25) {
  const lines: string[] = [];
  let line = "";
  const words = text
    .split(" ")
    .flatMap((w) =>
      w.length > max ? w.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ") : [w],
    );
  for (const word of words) {
    if (line && (line + " " + word).length > max) {
      lines.push(line);
      line = word;
    } else line += (line ? " " : "") + word;
  }
  if (line) lines.push(line);
  return lines;
}
const diagramCss = `.node rect{fill:#fffefa;stroke:#9ca9a0;stroke-width:1}.node.selected rect{fill:#e2e9e2;stroke:#385d55;stroke-width:2}.node.agent rect{stroke:#a18a70}.node.store rect{stroke:#6b8a7e}.node text{font-family:Arial,sans-serif;pointer-events:none}.node .node-type{fill:#53665c;font-size:12px}.node .node-title{fill:#262d2b;font-size:20px;font-weight:500}.node .node-sub{fill:#53665c;font-size:12px}.node .node-corner{fill:#385d55;font-size:17px}.node.agent .node-type,.node.agent .node-corner{fill:#725840}.node:focus rect{stroke:#385d55;stroke-width:3}.edge{fill:none;stroke:#97a79b;stroke-width:1.2;marker-end:url(#arrow)}.edge.optional{stroke-dasharray:5 5}.edge.active{stroke:#385d55;stroke-width:1.8}.edge-label{fill:#4c6256;font:12px Arial,sans-serif;text-anchor:middle}.boundary{fill:none;stroke:#b4c0b4;stroke-dasharray:4 7;stroke-width:1}.boundary-label{fill:#53665c;font:11px Arial,sans-serif;letter-spacing:.4px}`;
const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
style.textContent = diagramCss;
svg.insertBefore(style, svg.firstChild);
function renderDiagram() {
  const graph = graphs[graphKey()];
  if (!graph.nodes.some((n) => n.id === selected)) selected = graph.nodes[0].id;
  $("#diagram-title").textContent = graph.title;
  $("#diagram-counter").textContent =
    `C${{ context: 1, containers: 2, components: 3, code: 4 }[level]} / 4`;
  $("#diagram-caption").textContent =
    graph.caption + (graph.note ? " " + graph.note : "");
  $("#diagram-panel").setAttribute("aria-labelledby", "tab-" + level);
  svg.setAttribute(
    "aria-label",
    graph.title + ". Блоки можно выбрать клавишей Enter.",
  );
  const edgeMarkup = graph.edges
    .map((e, i) => {
      const a = graph.nodes.find((n) => n.id === e.from)!,
        b = graph.nodes.find((n) => n.id === e.to)!;
      let path = "",
        lx = 0,
        ly = 0;
      if (a.y === b.y) {
        const forward = b.x > a.x;
        const ax = a.x + (forward ? 220 : 0),
          bx = b.x + (forward ? 0 : 220),
          y = a.y + 63;
        path = `M${ax} ${y} H${bx}`;
        lx = (ax + bx) / 2;
        ly = y - 10;
      } else {
        const down = b.y > a.y,
          ax = a.x + 110,
          ay = a.y + (down ? 126 : 0),
          bx = b.x + 110,
          by = b.y + (down ? 0 : 126),
          mid = (ay + by) / 2 + ((i % 3) - 1) * 15;
        if (graphKey() === "containers" && b.y === 500) {
          const gutter = b.x === 38 ? 320 : b.x === 383 ? 666 : 1003,
            upper = 250 + (i - 5) * 15;
          path = `M${ax} ${ay} V${upper} H${gutter} V460 H${bx} V${by}`;
          lx = (gutter + bx) / 2;
          ly = 451;
        } else {
          path = `M${ax} ${ay} V${mid} H${bx} V${by}`;
          lx = ax === bx ? ax + 55 : (ax + bx) / 2;
          ly = ax === bx ? (ay + by) / 2 : mid - 8;
        }
      }
      return `<path class="edge ${e.optional ? "optional" : ""} ${e.from === selected || e.to === selected ? "active" : ""}" d="${path}"/><rect x="${lx - e.label.length * 3.3 - 5}" y="${ly - 12}" width="${e.label.length * 6.6 + 10}" height="17" rx="2" fill="#f1f3ee"/><text class="edge-label" x="${lx}" y="${ly}">${esc(e.label)}</text>`;
    })
    .join("");
  const nodeMarkup = graph.nodes
    .map((n) => {
      const d = nodes[n.id],
        isAgent = /LLM|Vision|Внешняя система/.test(d.type),
        isStore = /Хранилище/.test(d.type),
        title = wrapText(d.title, 18),
        sub = wrapText(d.sub, 29);
      return `<g class="node ${isAgent ? "agent" : ""} ${isStore ? "store" : ""} ${n.id === selected ? "selected" : ""}" transform="translate(${n.x},${n.y})" role="button" tabindex="0" aria-label="${esc(d.title)}: ${esc(d.type)}" aria-pressed="${n.id === selected}" data-node="${n.id}" style="cursor:pointer"><rect width="220" height="126" rx="4"/><text class="node-type" x="16" y="23">${esc(d.type.replace("Компонент · ", "").replace("Контейнер · ", "").replace("Код · ", ""))}</text>${title.map((t, j) => `<text class="node-title" x="16" y="${52 + j * 23}">${esc(t)}</text>`).join("")}${sub
        .slice(0, 2)
        .map(
          (t, j) =>
            `<text class="node-sub" x="16" y="${title.length > 1 ? 98 + j * 13 : 85 + j * 13}">${esc(t)}</text>`,
        )
        .join("")}<text class="node-corner" x="194" y="24">↗</text></g>`;
    })
    .join("");
  content.innerHTML =
    (graph.boundary
      ? `<rect class="boundary" x="19" y="47" width="984" height="584" rx="7"/><text class="boundary-label" x="38" y="67">${esc(graph.boundary)}</text>`
      : "") +
    edgeMarkup +
    nodeMarkup;
  $("#node-index").innerHTML = graph.nodes
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
  $("#component-selector").hidden = level !== "components";
  $$("[data-focus]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.focus === focus)),
  );
}
function renderInspector() {
  const d = nodes[selected];
  $("#inspector").innerHTML =
    `<p class="eyebrow">${esc(d.type)}</p><h3>${esc(d.title)}</h3><p class="inspector-description">${esc(d.description)}</p><dl><dt>НА ВХОДЕ</dt>${d.inputs.map((s) => `<dd>${esc(s)}</dd>`).join("")}<dt>НА ВЫХОДЕ</dt>${d.outputs.map((s) => `<dd>${esc(s)}</dd>`).join("")}</dl>${d.storage ? `<p class="storage-ref">${esc(d.storage)}</p>` : ""}<p class="eyebrow" style="margin:22px 0 0">ОСНОВАНИЕ В КОДЕ</p>${sourceLinks(d.sources)}`;
}
function updateTransform() {
  content.setAttribute(
    "transform",
    `translate(${panX} ${panY}) translate(510 332.5) scale(${zoom}) translate(-510 -332.5)`,
  );
  $("#zoom-label").textContent = Math.round(zoom * 100) + "%";
  $("#zoom-out").toggleAttribute("disabled", zoom <= 0.6);
  $("#zoom-in").toggleAttribute("disabled", zoom >= 2.2);
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
    focus = target.dataset.focus;
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
  const scale = 1020 / svg.getBoundingClientRect().width;
  panX = drag.px + (e.clientX - drag.x) * scale;
  panY = drag.py + (e.clientY - drag.y) * scale;
  updateTransform();
});
svg.addEventListener("pointerup", () => (drag = null));
svg.addEventListener("pointercancel", () => (drag = null));
$("#zoom-in").addEventListener("click", () => {
  zoom = Math.min(2.2, Math.round((zoom + 0.2) * 10) / 10);
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
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", "1020");
  clone.setAttribute("height", "665");
  clone.querySelector("#diagram-content")?.removeAttribute("transform");
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", "1020");
  rect.setAttribute("height", "665");
  rect.setAttribute("fill", "#f1f3ee");
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
      "dimensions",
      "geometry_relations",
      "features",
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
    if (["recognition", "selection", "routing", "materials"].includes(key)) {
      level = "components";
      focus = key;
    } else level = key;
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
