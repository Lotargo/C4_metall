const banner = document.querySelector<HTMLElement>('[data-product-banner]');
if (banner) {
  const button = banner.querySelector<HTMLButtonElement>('[data-banner-motion]')!;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = media.matches;
  let visible = true;
  function sync() {
    banner!.classList.toggle('motion-paused', paused || !visible || document.hidden);
    button.hidden = media.matches;
    button.setAttribute('aria-pressed', String(paused));
    button.querySelector('[data-motion-label]')!.textContent = paused ? 'Включить анимацию' : 'Остановить анимацию';
    button.querySelector('[data-motion-symbol]')!.textContent = paused ? '▷' : 'Ⅱ';
  }
  button.addEventListener('click', () => { paused = !paused; sync(); });
  media.addEventListener('change', () => { paused = media.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(banner);
  sync();
}
