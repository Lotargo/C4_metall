export {};

type Theme = 'light' | 'dark';
const key = 'pp-theme';
const root = document.documentElement;
const system = window.matchMedia('(prefers-color-scheme: dark)');
const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const valid = (value: string | null): value is Theme => value === 'light' || value === 'dark';
let preference: Theme | null = null;
try {
  const saved = localStorage.getItem(key);
  if (valid(saved)) preference = saved;
} catch { /* The switch also works when storage is unavailable. */ }

const updateButton = () => {
  const label = root.dataset.theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';
  button?.setAttribute('aria-label', label);
  button?.setAttribute('title', label);
};
const apply = (theme: Theme) => {
  const changed = root.dataset.theme !== theme;
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#161d1a' : '#f7f6f2');
  updateButton();
  if (changed) window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
};
apply(preference ?? (system.matches ? 'dark' : 'light'));
if (button) {
  button.hidden = false;
  button.addEventListener('click', () => {
    preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(key, preference); } catch {}
    apply(preference);
  });
}
system.addEventListener('change', () => {
  if (!preference) apply(system.matches ? 'dark' : 'light');
});
window.addEventListener('storage', (event) => {
  if (event.key !== key && event.key !== null) return;
  preference = valid(event.newValue) ? event.newValue : null;
  apply(preference ?? (system.matches ? 'dark' : 'light'));
});
