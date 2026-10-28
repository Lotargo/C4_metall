export {};
import { initializeDocumentToc, setTocExpanded } from '../utils/document-toc.mjs';

const navigation = document.querySelector<HTMLDetailsElement>('.implementation-navigation');
const mobile = window.matchMedia('(max-width: 1000px)');
const header = document.querySelector<HTMLElement>('.implementation-header');
if (header) {
  const measureHeader = () => document.documentElement.style.setProperty('--implementation-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
  measureHeader();
  new ResizeObserver(measureHeader).observe(header);
}
const summary = navigation?.querySelector('summary');
if (summary) {
  const measureSummary = () => document.documentElement.style.setProperty('--implementation-navigation-summary-height', `${Math.ceil(summary.getBoundingClientRect().height)}px`);
  measureSummary();
  new ResizeObserver(measureSummary).observe(summary);
}
const syncNavigation = () => { if (navigation) navigation.open = !mobile.matches; };
syncNavigation();
mobile.addEventListener('change', syncNavigation);
const toc = document.querySelector<HTMLElement>('[data-editor-toc]');
if (toc) initializeDocumentToc(toc);

const updateTableFocus = () => {
  document.querySelectorAll<HTMLTableElement>('.markdown-document table').forEach((table) => {
    if (table.scrollWidth > table.clientWidth) table.tabIndex = 0;
    else table.removeAttribute('tabindex');
  });
};
updateTableFocus();
window.addEventListener('resize', updateTableFocus);

// Keep anchors usable with native navigation, browser history and no JavaScript.
document.addEventListener('click', (event) => {
  const imageSize = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-attachment-size]');
  if (imageSize) {
    const original = imageSize.getAttribute('aria-pressed') !== 'true';
    imageSize.setAttribute('aria-pressed', String(original));
    imageSize.textContent = original ? 'По ширине документа' : 'Исходный размер';
    imageSize.closest('[data-attachment-preview]')?.querySelector('.attachment-image-viewport')?.classList.toggle('original-size', original);
    return;
  }
  const toggle = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-toc-toggle]');
  if (toggle) {
    setTocExpanded(toggle, toggle.getAttribute('aria-expanded') !== 'true');
    return;
  }
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('[data-document-toc]');
  if (link) {
    if (mobile.matches && navigation) {
      navigation.open = false;
      // Move focus into the reading area without mutating editable headings.
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('.implementation-main')?.focus({ preventScroll: true });
      });
    }
  }
});

navigation?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobile.matches && navigation.open) {
    navigation.open = false;
    navigation.querySelector('summary')?.focus();
  }
});

let lastActiveId: string | undefined;
const updateToc = () => {
  const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-document-toc]')];
  const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--implementation-header-height')) || 90;
  const offset = headerHeight + (mobile.matches ? (summary?.getBoundingClientRect().height || 78) + 14 : 30);
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
  if (active) {
    const group = active.closest<HTMLElement>('[data-toc-group]');
    const button = group?.querySelector<HTMLButtonElement>('[data-toc-toggle]');
    if (button && (active.dataset.documentToc !== lastActiveId || active.closest('[data-toc-children]')?.hasAttribute('hidden'))) {
      // Open the section being read, including a direct link to a subsection.
      setTocExpanded(button, true);
    }
    const scroll = document.querySelector<HTMLElement>('[data-toc-scroll]');
    if (scroll && active.dataset.documentToc !== lastActiveId && (!mobile.matches || navigation?.open)) {
      const bounds = scroll.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      if (rect.top < bounds.top) scroll.scrollTop -= bounds.top - rect.top + 8;
      else if (rect.bottom > bounds.bottom) scroll.scrollTop += rect.bottom - bounds.bottom + 8;
    }
    lastActiveId = active.dataset.documentToc;
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
window.addEventListener('hashchange', () => requestAnimationFrame(updateToc));
navigation?.addEventListener('toggle', () => { lastActiveId = undefined; updateToc(); });
window.addEventListener('documentcontentchange', () => { updateTableFocus(); updateToc(); });

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
      if (!figure.isConnected) continue;
      const code = figure.querySelector('code')?.textContent || '';
      const viewport = figure.querySelector<HTMLElement>('.diagram-viewport')!;
      const status = figure.querySelector<HTMLElement>('.diagram-status')!;
      try {
        const { svg, bindFunctions } = await mermaid.render(`implementation-diagram-${index}-${pass}`, code);
        if (document.documentElement.dataset.theme !== theme) return;
        if (!figure.isConnected) continue;
        viewport.hidden = false;
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
const queueDiagrams = () => {
  // A seed does not mean the editor loaded. Keep the server-rendered diagrams
  // usable while it loads or if its module fails; mounted node views own theirs.
  if (!document.querySelector('#editor .tiptap')) diagramRendering = diagramRendering.then(renderDiagrams);
};
window.addEventListener('themechange', queueDiagrams);
queueDiagrams();
