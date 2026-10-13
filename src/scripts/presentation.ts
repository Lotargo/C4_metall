import screenshots from "../data/screenshots.json";
import "./shared";

const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
const $$ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  Array.from(document.querySelectorAll<T>(selector));

// Image inspection preserves the actual pixels of the historical QA capture.
const imageDialog = $<HTMLDialogElement>("#image-dialog");
let imageTrigger: HTMLElement | null = null;
document.addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLElement>("[data-image]");
  if (!button) return;
  const item = screenshots.find((s) => s.id === button.dataset.image);
  if (!item) return;
  imageTrigger = button;
  $("#image-dialog-title").textContent = item.title;
  $("#image-dialog-note").textContent =
    `Скриншот интерфейса от ${item.date}. ${item.note}`;
  const image = $<HTMLImageElement>("#image-dialog-img");
  image.src = item.file;
  image.alt = item.title;
  image.width = item.width;
  image.height = item.height;
  imageDialog.showModal();
  $("#close-image").focus();
});
$("#close-image").addEventListener("click", () => imageDialog.close());
imageDialog.addEventListener("close", () => imageTrigger?.focus());
imageDialog.addEventListener("click", (event) => {
  if (event.target !== imageDialog) return;
  const rect = imageDialog.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    imageDialog.close();
});
$$("[data-screen]").forEach((button) =>
  button.addEventListener("click", () => {
    const id = button.dataset.screen;
    $$("[data-screen]").forEach((tab) => {
      const active = tab.dataset.screen === id;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    $$(".screen-panel").forEach(
      (panel) => (panel.hidden = panel.id !== "screen-panel-" + id),
    );
  }),
);

// Presentation is a local reading mode; each chapter remains scrollable.
const chapters = $$("[data-chapter]");
const trigger = $("#start-presentation");
let presenting = false;
let current = 0;
let returnScroll = 0;
function showChapter(index: number, focus = true) {
  current = Math.max(0, Math.min(chapters.length - 1, index));
  chapters.forEach((chapter, i) =>
    chapter.classList.toggle("chapter-active", i === current),
  );
  $("#chapter-status").textContent =
    `${current + 1} / ${chapters.length} · ${chapters[current].dataset.chapter}`;
  $<HTMLButtonElement>("#chapter-prev").disabled = current === 0;
  $<HTMLButtonElement>("#chapter-next").disabled =
    current === chapters.length - 1;
  window.scrollTo({ top: 0, behavior: "instant" });
  if (focus) {
    const heading = chapters[current].querySelector<HTMLElement>("h1, h2")!;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
}
function endPresentation() {
  presenting = false;
  document.body.classList.remove("presenting");
  chapters.forEach((chapter) => chapter.classList.remove("chapter-active"));
  $("#presentation-bar").hidden = true;
  trigger.setAttribute("aria-pressed", "false");
  trigger.innerHTML = 'Режим показа <span aria-hidden="true">↗</span>';
  window.scrollTo({ top: returnScroll, behavior: "instant" });
  trigger.focus({ preventScroll: true });
}
trigger.addEventListener("click", () => {
  if (presenting) {
    endPresentation();
    return;
  }
  returnScroll = window.scrollY;
  const nearest = chapters.findIndex(
    (chapter) => chapter.getBoundingClientRect().bottom > 140,
  );
  presenting = true;
  document.body.classList.add("presenting");
  $("#presentation-bar").hidden = false;
  trigger.setAttribute("aria-pressed", "true");
  trigger.innerHTML = 'Завершить показ <span aria-hidden="true">×</span>';
  showChapter(Math.max(0, nearest));
});
$("#chapter-prev").addEventListener("click", () => showChapter(current - 1));
$("#chapter-next").addEventListener("click", () => showChapter(current + 1));
$("#end-presentation").addEventListener("click", endPresentation);
document.addEventListener("keydown", (event) => {
  if (!presenting || document.querySelector("dialog[open], .atlas.expanded"))
    return;
  if (event.key === "Escape") {
    endPresentation();
    return;
  }
  const target = event.target as Element;
  if (
    target.closest(
      'input, textarea, select, button, summary, [role="tablist"], [contenteditable]',
    )
  )
    return;
  if (event.key === "ArrowRight" || event.key === "PageDown") {
    event.preventDefault();
    showChapter(current + 1);
  }
  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    showChapter(current - 1);
  }
});
document.addEventListener("click", (event) => {
  const link = (event.target as Element).closest<HTMLAnchorElement>(
    'a[href^="#"]',
  );
  if (!link) return;
  const id = link.getAttribute("href")!.slice(1);
  const target = document.getElementById(id);
  if (!target) return;
  // A C4 deep link must reveal its containing disclosure.
  if (target instanceof HTMLDetailsElement) target.open = true;
  if (presenting) {
    const chapter = target.closest<HTMLElement>("[data-chapter]");
    if (chapter) {
      event.preventDefault();
      showChapter(chapters.indexOf(chapter));
    }
  }
});
window.addEventListener("beforeprint", () =>
  document.body.classList.remove("presenting"),
);
window.addEventListener("afterprint", () => {
  if (presenting) document.body.classList.add("presenting");
});
