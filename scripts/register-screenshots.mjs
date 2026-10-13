import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
// Unedited copies of product QA captures. Several sources are JPEG bytes with a
// .png name; the public copy only corrects the extension, never the pixels.
const images = [
  {
    id: "workspace",
    file: "/screenshots/workspace-passport.jpg",
    source: "docs/QA/voksa-adoption-smoke-2026-10-13/s1.1-followup-02/main-ui-restored.png",
    date: "13.10.2026",
    width: 1274,
    height: 717,
    title: "Чертёж и паспорт рядом",
    text: "Слева — исходный лист с зонами распознавания, справа — инженерный паспорт: реквизиты из рамки, общие технические данные и поверхности. Статус «Требует проверки» остаётся до решения технолога. Открыт исторический запуск от 02.10.",
    note: "Исторический запуск от 02.10.2026, открытый 13.10.2026 в основном интерфейсе.",
    sources: ["review", "reviewCurrent", "operator"],
    point: "Каждый факт паспорта можно сверить с исходным листом.",
  },
  {
    id: "progress",
    file: "/screenshots/pipeline-progress.jpg",
    source: "docs/QA/voksa-adoption-smoke-2026-10-13/s1.1-followup-02/fresh-housing-attempt-20/browser-passport.png",
    date: "13.10.2026",
    width: 934,
    height: 823,
    title: "Ход автоматической обработки",
    text: "После загрузки обработка идёт по четырём стадиям: чертёж и геометрия, материалы и НСИ, оборудование, техмаршрут. На снимке первые три завершены, планировщик составляет маршрут. Окно можно свернуть и открыть трассировку.",
    note: "Свежий запуск на чертеже заказчика 13.10.2026.",
    sources: ["continuation", "routeJobs"],
    point: "Цепочка продолжается сама, а ход виден технологу.",
  },
  {
    id: "surfaces",
    file: "/screenshots/surface-registry.jpg",
    source: "docs/QA/voksa-adoption-smoke-2026-10-13/s1.1-followup-01/surfaces-reopened.png",
    date: "13.10.2026",
    width: 934,
    height: 823,
    title: "Поверхности и принадлежность размеров",
    text: "Для каждого элемента видны сторона, роль, собственные размеры и контекст, а также источник: распознавание или ручное решение с основанием. Две нижние строки — контрольные записи QA-проверки, сохранённые после повторного открытия.",
    note: "Две нижние строки — контрольные QA-записи, не факты чертежа.",
    sources: ["surfaceRegistryView", "surfaceRegistry", "featureSurface"],
    point: "Сторону поверхности и принадлежность размера можно проверить и исправить.",
  },
  {
    id: "mentions",
    file: "/screenshots/description-mentions.jpg",
    source: "docs/QA/voksa-adoption-smoke-2026-10-13/s1.1-followup-01/warnings-and-link.png",
    date: "13.10.2026",
    width: 934,
    height: 823,
    title: "Проверка полноты описания",
    text: "Диаметры, названные в описании модели, но не привязанные к элементу, показываются вопросами. Технолог добавляет поверхность из упоминания или указывает другую роль. Здесь показаны контрольные примеры QA-проверки.",
    note: "Все упоминания на снимке — контрольные QA-примеры, не факты чертежа.",
    sources: ["geometryMentions", "mentionModel", "surfaceRegistryView"],
    point: "Упоминание в описании не становится фактом без решения человека.",
  },
  {
    id: "route",
    file: "/screenshots/route-map.jpg",
    source: "docs/QA/voksa-adoption-smoke-2026-10-13/s1/K1/attempt-1/browser-result-full.png",
    date: "13.10.2026",
    width: 934,
    height: 1882,
    focusY: "26%",
    title: "Карта технологического маршрута",
    text: "Девять операций от исходной заготовки до контроля. На каждом этапе — материал, габарит, плановая масса и станок из каталога; задачи раскрываются по строке. Статус «Требует уточнения» и условия остаются видимыми. Ревизия 11 инженерно не принималась.",
    note: "Ревизия маршрута 11 от 13.10.2026 для запуска от 09.10.2026. Полная карта — с прокруткой.",
    sources: ["routeMass", "routeSave", "routeReview"],
    point: "Маршрут — предварительное предложение с массами и условиями.",
  },
  {
    id: "tables",
    file: "/screenshots/reference-tables.png",
    source: "docs/QA/UI_REFACTOR_EVIDENCE_2026-10-01/catalog-light-controls.png",
    date: "01.10.2026",
    width: 1274,
    height: 717,
    title: "Рабочие таблицы справочника",
    text: "Технолог видит таблицы сортамента, активную ревизию и строки данных. Правки в интерфейсе и CSV проходят через общий сервис версий.",
    note: "Число записей относится к дате снимка.",
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
    note: "Число записей относится к дате снимка.",
    sources: ["machines", "routeContext"],
    point: "Планировщик получает сведения об оборудовании из каталога.",
  },
];
for (const image of images) {
  const bytes = await readFile("public" + image.file);
  const original = await readFile("F:/projects/metall-dev-2/" + image.source);
  if (!bytes.equals(original)) throw Error("Screenshot changed: " + image.file);
  image.sha256 = createHash("sha256").update(bytes).digest("hex");
  image.basis =
    "Product QA capture copied without editing. Shows the UI on its capture date; not evidence of model quality or engineering acceptance.";
}
await writeFile(
  "src/data/screenshots.json",
  JSON.stringify(images, null, 2) + "\n",
);
console.log(`Registered ${images.length} unmodified product UI captures`);
