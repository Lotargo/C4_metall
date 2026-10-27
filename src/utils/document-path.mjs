export function implementationPath(id) {
  return `/implementation/${id.split('/').map(encodeURIComponent).join('/')}/`;
}
