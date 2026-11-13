export {};

const sidebar = document.getElementById('metall-sidebar');
const dialog = document.querySelector<HTMLDialogElement>('#metall-nav-dialog');
const open = document.querySelector<HTMLButtonElement>('[data-metall-open]');
const close = document.querySelector<HTMLButtonElement>('[data-metall-close]');
const desktop = matchMedia('(min-width: 1200px)');

if (sidebar && dialog && open && close) {
  const originalParent = sidebar.parentNode;
  const restore = () => {
    originalParent?.insertBefore(sidebar, dialog);
    open.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('metall-navigation-open');
  };
  open.addEventListener('click', () => {
    if (dialog.open) return;
    dialog.append(sidebar);
    dialog.showModal();
    open.setAttribute('aria-expanded', 'true');
    document.body.classList.add('metall-navigation-open');
    close.focus();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', restore);
  dialog.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target === dialog || target.closest('a')) dialog.close();
  });
  desktop.addEventListener('change', () => { if (desktop.matches && dialog.open) dialog.close(); });
}

const sectionLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-metall-section]')];
const sections = sectionLinks.map((link) => document.getElementById(link.dataset.metallSection ?? '')).filter((section): section is HTMLElement => !!section);
if (sections.length) {
  // Read positions on scroll because several short sections can be visible together.
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const current = sections.filter((section) => section.getClientRects().length && section.getBoundingClientRect().top <= 150).at(-1) ?? sections[0];
    for (const link of sectionLinks) {
      if (link.dataset.metallSection === current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, { passive: true });
  // Presentation chapters can change without moving the page from scrollY = 0.
  const chapterChanges = new MutationObserver(update);
  for (const section of sections) chapterChanges.observe(section, { attributes: true, attributeFilter: ['class', 'hidden'] });
  update();
}
