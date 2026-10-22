import screenshots from "../data/plan-screens.json";
import "./shared";
import { openImage } from "./image-viewer";

const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
const $$ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  Array.from(document.querySelectorAll<T>(selector));

// Table of contents: highlight the section being read.
const links = $$<HTMLAnchorElement>("[data-toc]");
const targets = links
  .map((link) => document.getElementById(link.dataset.toc!))
  .filter((el): el is HTMLElement => !!el);
function markCurrent() {
  const line = 140;
  let current = targets[0];
  for (const target of targets)
    if (target.getBoundingClientRect().top <= line) current = target;
  links.forEach((link) => {
    const active = link.dataset.toc === current?.id;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  // Keep the highlighted entry visible inside a long contents list.
  const box = $(".doc-toc");
  const link = links.find((l) => l.classList.contains("active"));
  if (!link || box.scrollHeight <= box.clientHeight) return;
  const top =
    link.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
  if (top < box.scrollTop + 40) box.scrollTop = top - 40;
  else if (top > box.scrollTop + box.clientHeight - 60)
    box.scrollTop = top - box.clientHeight + 60;
}
window.addEventListener("scroll", markCurrent, { passive: true });
markCurrent();

// On phones the contents box folds away after a jump.
const tocBox = $<HTMLDetailsElement>(".doc-toc-box");
const phone = window.matchMedia("(max-width: 980px)");
if (phone.matches) tocBox.open = false;
links.forEach((link) =>
  link.addEventListener("click", () => {
    if (phone.matches) tocBox.open = false;
  }),
);

$("#print-doc").addEventListener("click", () => window.print());

// Screenshots open in the shared zoomable viewer.
document.addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLElement>("[data-image]");
  if (!button) return;
  const item = screenshots.find((s) => s.id === button.dataset.image);
  if (item) openImage(item, button);
});
