import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const images = [
  {
    id: "tables",
    file: "/screenshots/reference-tables.png",
    source:
      "docs/QA/UI_REFACTOR_EVIDENCE_2026-10-01/catalog-light-controls.png",
    date: "01.10.2026",
    width: 1274,
    height: 717,
    title: "Рабочие таблицы справочника",
    text: "Технолог видит таблицы сортамента, активную ревизию и строки данных. Правки в интерфейсе и CSV проходят через общий сервис версий.",
    sources: ["editable", "csvRows"],
    point: "Расчёт опирается на конкретную версию справочных данных.",
  },
  {
    id: "catalogue",
    file: "/screenshots/machine-catalogue.jpg",
    source: "docs/QA/agent-route-p1p2-2026-10-09/production-catalogue.jpg",
    date: "09.10.2026",
    width: 934,
    height: 823,
    title: "Каталог оборудования",
    text: "Станки сгруппированы по категориям. Их текстовые паспорта передаются планировщику маршрута как контекст выбора оборудования.",
    sources: ["machines", "routeContext"],
    point: "Планировщик получает сведения об оборудовании из каталога.",
  },
  {
    id: "editor",
    file: "/screenshots/machine-editor.jpg",
    source: "docs/QA/agent-route-p1p2-2026-10-09/editor-1440.jpg",
    date: "09.10.2026",
    width: 1440,
    height: 900,
    title: "Редактор паспорта оборудования",
    text: "Название, категория и свободное описание станка сохраняются с версией. На скриншоте показана тестовая QA-запись.",
    sources: ["machines", "machinesDb"],
    point: "Описание оборудования можно дополнять по мере работы.",
  },
];
for (const image of images) {
  const bytes = await readFile("public" + image.file);
  const original = await readFile("F:/projects/metall-dev-2/" + image.source);
  if (!bytes.equals(original)) throw Error("Screenshot changed: " + image.file);
  image.sha256 = createHash("sha256").update(bytes).digest("hex");
  image.basis =
    "Historical product QA capture; copied without editing. Not a new live run or evidence of the current UI state.";
}
await writeFile(
  "src/data/screenshots.json",
  JSON.stringify(images, null, 2) + "\n",
);
console.log(`Registered ${images.length} unmodified historical UI captures`);
