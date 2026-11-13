export {};

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const reveal = (element: Element, distance = 12, duration = 380) => {
  if (motion.matches || !element.animate) return;
  element.animate([
    { opacity: .25, transform: `translateY(${distance}px)` },
    { opacity: 1, transform: 'translateY(0)' },
  ], { duration, easing: 'cubic-bezier(.22,1,.36,1)' });
};

// One observer and one brief animation per content group. Content is visible
// without JS and reduced-motion visitors never pass through a hidden state.
const entrance = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entrance.unobserve(entry.target);
    reveal(entry.target);
  }
}, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
document.querySelectorAll('.section-heading, .principles, .method-strip, .anatomy, .destination-list, .metall-product-proof').forEach((element) => entrance.observe(element));

document.addEventListener('toggle', (event) => {
  const detail = event.target;
  if (!(detail instanceof HTMLDetailsElement)) return;
  const label = detail.querySelector('.role-open-label');
  if (label) label.textContent = detail.open ? 'Свернуть' : 'Подробнее';
  if (!detail.open) return;
  if (!detail.matches('.agent-row, .bounded-detail, .technical-detail')) return;
  const body = detail.querySelector('.agent-body') ?? [...detail.children].find((child) => child.tagName !== 'SUMMARY');
  if (body) reveal(body, 6, 220);
}, true);

document.addEventListener('click', (event) => {
  const tab = (event.target as Element).closest('[role="tab"]');
  const id = tab?.getAttribute('aria-controls');
  if (!id) return;
  queueMicrotask(() => {
    const panel = document.getElementById(id);
    if (panel && !panel.hidden) reveal(panel, 7, 240);
  });
});
