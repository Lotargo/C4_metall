export {};

const navigation = document.querySelector<HTMLDetailsElement>('.implementation-navigation');
const mobile = window.matchMedia('(max-width: 1000px)');
const syncNavigation = () => { if (navigation) navigation.open = !mobile.matches; };
syncNavigation();
mobile.addEventListener('change', syncNavigation);

const updateTableFocus = () => {
  document.querySelectorAll<HTMLTableElement>('.markdown-document table').forEach((table) => {
    if (table.scrollWidth > table.clientWidth) table.tabIndex = 0;
    else table.removeAttribute('tabindex');
  });
};
updateTableFocus();
window.addEventListener('resize', updateTableFocus);

// Keep anchors usable with native navigation, browser history and no JavaScript.
document.querySelectorAll<HTMLAnchorElement>('[data-document-toc]').forEach((link) => {
  link.addEventListener('click', () => {
    if (mobile.matches && navigation) {
      navigation.open = false;
      const heading = document.getElementById(link.dataset.documentToc!);
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
    }
  });
});

const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-document-toc]')];
const updateToc = () => {
  const offset = mobile.matches ? 160 : 120;
  let active: HTMLAnchorElement | undefined = tocLinks[0];
  for (const link of tocLinks) {
    const heading = document.getElementById(link.dataset.documentToc!);
    if (heading && heading.getBoundingClientRect().top <= offset) active = link;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) active = tocLinks.at(-1);
  for (const link of tocLinks) {
    const selected = link === active;
    link.classList.toggle('active', selected);
    if (selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
};
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { updateToc(); ticking = false; });
}, { passive: true });
updateToc();
window.addEventListener('resize', updateToc);

const printButton = document.querySelector<HTMLButtonElement>('[data-document-print]');
if (printButton) {
  printButton.hidden = false;
  printButton.addEventListener('click', () => window.print());
}

let diagramRenderPass = 0;
async function renderDiagrams() {
  const figures = [...document.querySelectorAll<HTMLElement>('.document-diagram')];
  if (!figures.length) return;
  try {
    // No Mermaid download on documents without diagrams or on other pages.
    const { default: mermaid } = await import('mermaid');
    const theme = document.documentElement.dataset.theme;
    const pass = ++diagramRenderPass;
    const palette = getComputedStyle(document.documentElement);
    const color = (name: string) => palette.getPropertyValue(name).trim();
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      theme: 'base',
      fontFamily: 'IBM Plex Sans, Arial, sans-serif',
      themeVariables: {
        useGradient: false, dropShadow: 'none',
        darkMode: theme === 'dark',
        background: color('--surface'),
        primaryColor: color('--accent-soft'), primaryTextColor: color('--ink'), primaryBorderColor: color('--accent'),
        lineColor: color('--muted'), secondaryColor: color('--wash'), tertiaryColor: color('--surface'),
        textColor: color('--ink'), edgeLabelBackground: color('--surface'),
        clusterBkg: color('--wash'), clusterBorder: color('--line'),
        noteBkgColor: color('--wash'), noteTextColor: color('--ink'),
      },
    });
    await document.fonts.ready;
    for (const [index, figure] of figures.entries()) {
      const code = figure.querySelector('code')?.textContent || '';
      const viewport = figure.querySelector<HTMLElement>('.diagram-viewport')!;
      const status = figure.querySelector<HTMLElement>('.diagram-status')!;
      try {
        const { svg, bindFunctions } = await mermaid.render(`implementation-diagram-${index}-${pass}`, code);
        if (document.documentElement.dataset.theme !== theme) return;
        viewport.innerHTML = svg;
        // Preserve Mermaid's own accessible title/description if supplied.
        const diagram = viewport.querySelector('svg');
        if (diagram) {
          // Keep labels at Mermaid's natural size; wide diagrams scroll horizontally.
          diagram.style.width = `${diagram.viewBox.baseVal.width}px`;
          if (!diagram.hasAttribute('aria-labelledby')) diagram.setAttribute('aria-label', figure.querySelector('figcaption')?.textContent || 'Схема');
        }
        bindFunctions?.(viewport);
        status.hidden = true;
        if (!figure.dataset.diagramRendered) figure.querySelector('details')?.removeAttribute('open');
        figure.dataset.diagramRendered = 'true';
      } catch {
        viewport.replaceChildren();
        viewport.hidden = true;
        status.textContent = 'Не удалось построить схему. Проверьте её текст ниже.';
      }
    }
    updateToc();
  } catch {
    for (const figure of figures) {
      figure.querySelector<HTMLElement>('.diagram-status')!.textContent = 'Не удалось загрузить схему. Её текст доступен ниже.';
      figure.querySelector<HTMLElement>('.diagram-viewport')!.hidden = true;
    }
  }
}
// Serialize Mermaid work so quick theme switches cannot overwrite a newer render.
let diagramRendering = Promise.resolve();
const queueDiagrams = () => { diagramRendering = diagramRendering.then(renderDiagrams); };
window.addEventListener('themechange', queueDiagrams);
queueDiagrams();
