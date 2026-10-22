export {};

const nav = document.querySelector<HTMLDetailsElement>('.results-navigation');
const mobile = window.matchMedia('(max-width: 1000px)');
const adaptNavigation = () => { if (nav) nav.open = !mobile.matches; };
adaptNavigation();
mobile.addEventListener('change', adaptNavigation);

const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-result-toc]')];
const anchors = [...document.querySelectorAll<HTMLElement>('[data-result-anchor]')];
let scheduled = false;
function selectSection() {
  scheduled = false;
  const threshold = mobile.matches ? 180 : 150;
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  const current = atBottom ? anchors.at(-1)
    : anchors.filter((anchor) => anchor.getBoundingClientRect().top <= threshold).at(-1) ?? anchors[0];
  for (const link of links) {
    const active = link.dataset.resultToc === current?.id;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
window.addEventListener('scroll', () => {
  if (!scheduled) { scheduled = true; requestAnimationFrame(selectSection); }
}, { passive: true });
selectSection();
for (const link of links) link.addEventListener('click', () => {
  if (mobile.matches && nav) nav.open = false;
});

const dialog = document.querySelector<HTMLDialogElement>('#result-image-dialog')!;
const expanded = document.querySelector<HTMLImageElement>('#result-image-expanded')!;
const caption = document.querySelector<HTMLElement>('#result-image-caption')!;
const original = document.querySelector<HTMLAnchorElement>('#result-image-original')!;
const closeButton = document.querySelector<HTMLButtonElement>('#result-image-close')!;
const fitButton = document.querySelector<HTMLButtonElement>('#result-image-fit')!;
const widthButton = document.querySelector<HTMLButtonElement>('#result-image-width')!;
const actualButton = document.querySelector<HTMLButtonElement>('#result-image-actual')!;
const stage = document.querySelector<HTMLElement>('.result-image-stage')!;
type ImageSize = 'fit' | 'width' | 'actual';
let manualSize = false;
let currentSize: ImageSize = 'fit';
function imageSize(mode: ImageSize) {
  currentSize = mode;
  stage.classList.toggle('actual-size', mode === 'actual');
  stage.classList.toggle('width-size', mode === 'width');
  fitButton.setAttribute('aria-pressed', String(mode === 'fit'));
  widthButton.setAttribute('aria-pressed', String(mode === 'width'));
  actualButton.setAttribute('aria-pressed', String(mode === 'actual'));
  stage.scrollTo(0, 0);
}
const defaultImageSize = (image: HTMLImageElement): ImageSize =>
  image.naturalWidth > 0 && image.naturalHeight > image.naturalWidth * 2 ? 'width' : 'fit';
function chooseImageSize(mode: ImageSize) {
  manualSize = true;
  imageSize(mode);
}
let from: HTMLAnchorElement | null = null;
for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-result-image]')) {
  link.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const image = link.querySelector<HTMLImageElement>('img')!;
    from = link;
    manualSize = false;
    expanded.onload = () => {
      const mode = defaultImageSize(expanded);
      if (!manualSize && currentSize !== mode) imageSize(mode);
    };
    expanded.src = link.href;
    expanded.alt = image.alt;
    caption.textContent = link.dataset.caption ?? image.alt;
    original.href = link.href;
    imageSize(defaultImageSize(image));
    dialog.showModal();
    document.body.classList.add('result-image-open');
    closeButton.focus({ preventScroll: true });
  });
}
fitButton.addEventListener('click', () => chooseImageSize('fit'));
widthButton.addEventListener('click', () => chooseImageSize('width'));
actualButton.addEventListener('click', () => chooseImageSize('actual'));
closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => {
  document.body.classList.remove('result-image-open');
  from?.focus({ preventScroll: true });
});
