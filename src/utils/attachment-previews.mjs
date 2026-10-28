import catalog from '../data/document-attachments.json' with { type: 'json' };

const prefix = '/documents/implementation/';
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function attachmentKey(href) {
  if (!href || /^[a-z][a-z\d+.-]*:/i.test(href)) return null;
  let pathname;
  try { pathname = decodeURIComponent(href.split(/[?#]/)[0]); } catch { return null; }
  const marker = pathname.indexOf(prefix);
  const key = marker < 0 ? pathname.replace(/^\.\//, '') : pathname.slice(marker + prefix.length);
  return Object.hasOwn(catalog.assets, key) ? key : null;
}

export function attachmentPreviewHtml(key, label, base = '') {
  const asset = catalog.assets[key];
  if (!asset) return '';
  const name = escape(label || key.split('/').at(-1));
  const url = escape(base.replace(/\/$/, '') + prefix + key.split('/').map(encodeURIComponent).join('/'));
  const start = `<figure class="document-attachment" data-attachment-preview="${escape(key)}" contenteditable="false"><figcaption>${name}</figcaption>`;
  if (asset.kind === 'image') {
    return start + `<button type="button" class="attachment-image-size" data-attachment-size aria-pressed="false" aria-label="Исходный размер: ${name}">Исходный размер</button><div class="attachment-image-viewport" tabindex="0" role="region" aria-label="${name}"><img src="${url}" alt="${name}" width="${asset.width}" height="${asset.height}" loading="lazy" decoding="async"></div></figure>`;
  }
  return start + asset.sheets.map((sheet, index) => {
    const rows = sheet.rows.map((row, rowIndex) => '<tr>' + row.map((cell) => {
      const tag = rowIndex === 0 ? 'th' : 'td';
      return `<${tag}${rowIndex === 0 ? ' scope="col"' : ''}${typeof cell.value === 'number' ? ' class="attachment-number"' : ''}>${escape(cell.text)}</${tag}>`;
    }).join('') + '</tr>');
    return `<details class="attachment-sheet"${index === 0 ? ' open' : ''}><summary>${escape(sheet.name)}</summary><div class="attachment-table-viewport" tabindex="0" role="region" aria-label="${name}: ${escape(sheet.name)}"><table><caption class="sr-only">${name}: ${escape(sheet.name)}</caption><thead>${rows[0] || ''}</thead><tbody>${rows.slice(1).join('')}</tbody></table></div></details>`;
  }).join('') + '</figure>';
}
