import "./presentation";

const $$ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  Array.from(document.querySelectorAll<T>(selector));

$$("[data-pair]").forEach((button) =>
  button.addEventListener("click", () => {
    const id = button.dataset.pair;
    $$("[data-pair]").forEach((tab) => {
      const active = tab.dataset.pair === id;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    $$(".pair-panel").forEach(
      (panel) => (panel.hidden = panel.id !== "pair-panel-" + id),
    );
  }),
);

const plural = (n: number) =>
  n % 10 === 1 && n % 100 !== 11
    ? "механизм"
    : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
      ? "механизма"
      : "механизмов";
$$("[data-adopt-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    const filter = button.dataset.adoptFilter;
    $$("[data-adopt-filter]").forEach((chip) =>
      chip.setAttribute("aria-pressed", String(chip === button)),
    );
    let count = 0;
    $$(".adopt-row").forEach((row) => {
      row.hidden = filter !== "all" && row.dataset.status !== filter;
      if (!row.hidden) count++;
    });
    const counter = document.querySelector("#adopt-count");
    if (counter) counter.textContent = `${count} ${plural(count)}`;
  }),
);
