// Screenshot viewer shared by the presentation, the plan and the Voksa review.
// Opens fitted to the window; the wheel zooms around the cursor, the left
// button pans a zoomed image, a double click toggles fit / 100%, and a click
// on the empty area around the picture closes it.

import { sitePath } from '../utils/site-path.mjs';

export type ViewerImage = {
  file: string;
  title: string;
  note: string;
  date: string;
  width: number;
  height: number;
};

const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;

const dialog = $<HTMLDialogElement>("#image-dialog");
const stage = $("#image-stage");
const image = $<HTMLImageElement>("#image-dialog-img");
const label = $("#image-zoom-label");
const MAX = 6;

let current: ViewerImage | null = null;
let trigger: HTMLElement | null = null;
let scale = 1,
  x = 0,
  y = 0,
  fit = 1;

function apply() {
  image.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  label.textContent = Math.round(scale * 100) + "%";
  stage.classList.toggle("zoomed", scale > fit + 0.001);
  $<HTMLButtonElement>("#image-zoom-out").disabled = scale <= minScale() + 0.001;
  $<HTMLButtonElement>("#image-zoom-in").disabled = scale >= MAX - 0.001;
}
const minScale = () => Math.min(fit, 1);

// Keep the image inside the stage: centred when smaller, edge-bound when larger.
function clamp() {
  if (!current) return;
  const w = current.width * scale,
    h = current.height * scale,
    sw = stage.clientWidth,
    sh = stage.clientHeight;
  x = w <= sw ? (sw - w) / 2 : Math.min(0, Math.max(sw - w, x));
  y = h <= sh ? (sh - h) / 2 : Math.min(0, Math.max(sh - h, y));
}

function zoomTo(next: number, px = stage.clientWidth / 2, py = stage.clientHeight / 2) {
  next = Math.min(MAX, Math.max(minScale(), next));
  x = px - ((px - x) * next) / scale;
  y = py - ((py - y) * next) / scale;
  scale = next;
  clamp();
  apply();
}

function fitView() {
  if (!current) return;
  fit = Math.min(
    stage.clientWidth / current.width,
    stage.clientHeight / current.height,
    1,
  );
  scale = fit;
  clamp();
  apply();
}

export function openImage(item: ViewerImage, from?: HTMLElement | null) {
  current = item;
  trigger = from ?? null;
  $("#image-dialog-title").textContent = item.title;
  $("#image-dialog-note").textContent =
    `Скриншот интерфейса от ${item.date}. ${item.note}`;
  image.src = sitePath(item.file);
  image.alt = item.title;
  image.width = item.width;
  image.height = item.height;
  dialog.showModal();
  requestAnimationFrame(fitView);
  $("#close-image").focus();
}

stage.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    const rect = stage.getBoundingClientRect();
    const factor = Math.exp(-event.deltaY * (event.deltaMode === 1 ? 0.05 : 0.0018));
    zoomTo(scale * factor, event.clientX - rect.left, event.clientY - rect.top);
  },
  { passive: false },
);

// A click (no drag) on the empty area around the picture closes the viewer.
const outsideImage = (cx: number, cy: number) => {
  const r = image.getBoundingClientRect();
  return cx < r.left || cx > r.right || cy < r.top || cy > r.bottom;
};
let drag: { px: number; py: number; x: number; y: number; moved: boolean } | null = null;
stage.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  drag = { px: event.clientX, py: event.clientY, x, y, moved: false };
  stage.setPointerCapture(event.pointerId);
});
stage.addEventListener("pointermove", (event) => {
  stage.classList.toggle("can-close", !drag && outsideImage(event.clientX, event.clientY));
  if (!drag) return;
  const dx = event.clientX - drag.px,
    dy = event.clientY - drag.py;
  if (!drag.moved && Math.hypot(dx, dy) < 4) return;
  drag.moved = true;
  stage.classList.add("dragging");
  x = drag.x + dx;
  y = drag.y + dy;
  clamp();
  apply();
});
stage.addEventListener("pointerup", (event) => {
  const clicked = drag && !drag.moved;
  drag = null;
  stage.classList.remove("dragging");
  if (clicked && outsideImage(event.clientX, event.clientY)) dialog.close();
});
stage.addEventListener("pointercancel", () => {
  drag = null;
  stage.classList.remove("dragging");
});
stage.addEventListener("dblclick", (event) => {
  const rect = stage.getBoundingClientRect();
  if (scale > fit + 0.001) fitView();
  else zoomTo(1, event.clientX - rect.left, event.clientY - rect.top);
});

$("#image-zoom-in").addEventListener("click", () => zoomTo(scale * 1.4));
$("#image-zoom-out").addEventListener("click", () => zoomTo(scale / 1.4));
$("#image-fit").addEventListener("click", fitView);
$("#image-actual").addEventListener("click", () => zoomTo(1));
$("#close-image").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => trigger?.focus());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener("keydown", (event) => {
  if (event.key === "+" || event.key === "=") zoomTo(scale * 1.4);
  else if (event.key === "-") zoomTo(scale / 1.4);
  else if (event.key === "0") fitView();
  else return;
  event.preventDefault();
});
window.addEventListener("resize", () => {
  if (dialog.open) fitView();
});
