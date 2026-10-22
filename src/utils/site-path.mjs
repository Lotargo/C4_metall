// Public files and page links share the build's base path on every host.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function sitePath(path) {
  return path.startsWith('/') && !path.startsWith('//') ? base + path : path;
}
