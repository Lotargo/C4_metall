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
all("[data-agent-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    const filter = button.dataset.agentFilter;
    all("[data-agent-filter]").forEach((tab) =>
      tab.setAttribute("aria-pressed", String(tab === button)),
    );
    let count = 0;
    all(".agent-row").forEach((row) => {
      row.hidden = filter !== "all" && row.dataset.agentKind !== filter;
      if (!row.hidden) count++;
    });
    const counter = document.querySelector("#agent-count");
    const tens = count % 100, ones = count % 10;
    const word =
      tens > 10 && tens < 20 ? "ролей" : ones === 1 ? "роль" : ones > 1 && ones < 5 ? "роли" : "ролей";
    if (counter) counter.textContent = count + " " + word;
  }),
);
