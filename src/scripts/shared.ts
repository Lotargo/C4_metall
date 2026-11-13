const all = <T extends HTMLElement = HTMLElement>(selector: string) =>
  Array.from(document.querySelectorAll<T>(selector));

// Used by the presentation and the separate technical page.
all('[role="tablist"]').forEach((list) =>
  list.addEventListener("keydown", (event) => {
    if (
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(event.key)
    )
      return;
    const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));
    const current = tabs.indexOf(document.activeElement as HTMLElement);
    if (current < 0) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (current +
              (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1) +
              tabs.length) %
            tabs.length;
    tabs[next].click();
    tabs[next].focus();
  }),
);
all("[data-step]").forEach((button) =>
  button.addEventListener("click", () => {
    const id = button.dataset.step;
    all("[data-step]").forEach((tab) => {
      const active = tab.dataset.step === id;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    all(".step-panel").forEach(
      (panel) => (panel.hidden = panel.id !== "step-panel-" + id),
    );
  }),
);
const roleSearch = document.querySelector<HTMLInputElement>('[data-agent-search-input]');
const applyRoleFilters = () => {
    const filter = document.querySelector<HTMLElement>('[data-agent-filter][aria-pressed="true"]')?.dataset.agentFilter ?? 'all';
    const query = roleSearch?.value.trim().toLocaleLowerCase('ru-RU') ?? '';
    let count = 0;
    all(".agent-row[data-agent-kind]").forEach((row) => {
      const matchesKind = filter === 'all' || row.dataset.agentKind === filter;
      const matchesQuery = !query || (row.dataset.agentSearch ?? '').toLocaleLowerCase('ru-RU').includes(query);
      row.hidden = !matchesKind || !matchesQuery;
      if (!row.hidden) count++;
    });
    const counter = document.querySelector("#agent-count");
    const tens = count % 100, ones = count % 10;
    const word =
      tens > 10 && tens < 20 ? "ролей" : ones === 1 ? "роль" : ones > 1 && ones < 5 ? "роли" : "ролей";
    if (counter) counter.textContent = count + " " + word;
    const empty = document.querySelector<HTMLElement>('[data-agent-empty]');
    if (empty) empty.hidden = count !== 0;
    const clear = document.querySelector<HTMLButtonElement>('[data-agent-search-clear]');
    if (clear) clear.hidden = !query;
};
all("[data-agent-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    all("[data-agent-filter]").forEach((tab) => tab.setAttribute("aria-pressed", String(tab === button)));
    applyRoleFilters();
  }),
);
roleSearch?.addEventListener('input', applyRoleFilters);
document.querySelector('[data-agent-search-clear]')?.addEventListener('click', () => {
  if (!roleSearch) return;
  roleSearch.value = '';
  applyRoleFilters();
  roleSearch.focus();
});
applyRoleFilters();
