import screenshots from "../data/plan-screens.json";
import "./shared";

const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
const $$ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  Array.from(document.querySelectorAll<T>(selector));

// One tab per input item; the hash keeps the chosen item shareable.
function showTab(id: string, scroll = false) {
  if (!$$("[data-tab]").some((tab) => tab.dataset.tab === id)) return;
  $$("[data-tab]").forEach((tab) => {
    const active = tab.dataset.tab === id;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  $$(".plan-panel").forEach(
    (panel) => (panel.hidden = panel.id !== "panel-" + id),
  );
  history.replaceState(null, "", "#" + id);
  if (scroll) $("#items").scrollIntoView();
}
$$("[data-tab]").forEach((button) =>
  button.addEventListener("click", () => showTab(button.dataset.tab!)),
);
$$("[data-goto]").forEach((link) =>
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showTab(link.dataset.goto!, true);
  }),
);
showTab(location.hash.slice(1), true);

// Image inspection keeps the actual pixels of the QA capture.
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
