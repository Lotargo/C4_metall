import { openImage } from './image-viewer';

const dialog = document.querySelector<HTMLDialogElement>('#image-dialog')!;
const status = document.querySelector<HTMLElement>('#document-image-status')!;
let request = 0;

function imageTarget(element: Element) {
  if (!element.closest('#editor')) return;
  const link = element.closest<HTMLAnchorElement>('a[href]');
  if (link && /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(new URL(link.href).pathname)) {
    return { trigger: link, url: link.href, title: link.textContent?.trim() || 'Изображение' };
  }
  const image = element.closest<HTMLImageElement>('img[src]');
  if (image) return { trigger: image, url: image.currentSrc || image.src, title: image.alt || 'Изображение' };
}

function show(target: NonNullable<ReturnType<typeof imageTarget>>) {
  const ticket = ++request;
  status.textContent = 'Загружаем изображение…';
  const probe = new Image();
  probe.onload = () => {
    if (ticket !== request) return;
    status.textContent = '';
    document.body.classList.add('document-image-open');
    openImage({ file: target.url, title: target.title, note: 'Сохранённое изображение. Масштаб и прокрутка не изменяют документ.',
      width: probe.naturalWidth, height: probe.naturalHeight, scroll: true }, target.trigger);
  };
  probe.onerror = () => { if (ticket === request) status.textContent = 'Не удалось загрузить изображение. Проверьте соединение и повторите открытие.'; };
  probe.src = target.url;
}

// Capture before the editable document handles a link or selects an image.
document.addEventListener('click', event => {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
  const target = imageTarget(event.target);
  if (!target) return;
  event.preventDefault(); event.stopPropagation(); show(target);
}, true);
document.addEventListener('keydown', event => {
  if (!['Enter', ' '].includes(event.key) || event.ctrlKey || event.metaKey || !(event.target instanceof Element)) return;
  // Only an actually focused link/image is a keyboard trigger, never the editing surface.
  const target = imageTarget(event.target);
  if (!target || target.trigger !== document.activeElement) return;
  event.preventDefault(); event.stopPropagation(); show(target);
}, true);
dialog.addEventListener('close', () => document.body.classList.remove('document-image-open'));
