// Both the server-rendered page and the live editor use the same hierarchy.
export function groupDocumentHeadings(headings) {
  const groups = [];
  for (const heading of headings) {
    if (heading.depth === 2 || (heading.depth === 3 && !groups.length)) {
      groups.push({ heading, children: [] });
    } else if (heading.depth === 3) {
      groups.at(-1).children.push(heading);
    }
  }
  return groups;
}

export function setTocExpanded(button, expanded) {
  button.setAttribute('aria-expanded', String(expanded));
  const children = button.closest('[data-toc-group]').querySelector('[data-toc-children]');
  children.hidden = !expanded;
}

export function initializeDocumentToc(container) {
  for (const button of container.querySelectorAll('[data-toc-toggle]')) {
    button.hidden = false;
    setTocExpanded(button, button.getAttribute('aria-expanded') === 'true');
  }
}

export function renderDocumentToc(container, headings) {
  const expanded = new Set([...container.querySelectorAll('[data-toc-toggle][aria-expanded="true"]')]
    .map((button) => button.closest('[data-toc-group]').dataset.tocGroup));
  const fragment = document.createDocumentFragment();
  const linkFor = (heading) => {
    const link = document.createElement('a');
    link.href = `#${heading.slug}`;
    link.dataset.documentToc = heading.slug;
    link.textContent = heading.text;
    return link;
  };
  for (const { heading, children } of groupDocumentHeadings(headings)) {
    const item = document.createElement('li');
    item.dataset.tocGroup = heading.slug;
    const row = document.createElement('div');
    row.className = 'toc-heading';
    row.append(linkFor(heading));
    item.append(row);
    if (children.length) {
      const list = document.createElement('ol');
      list.id = `toc-children-${heading.slug}`;
      list.dataset.tocChildren = '';
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tocToggle = '';
      button.setAttribute('aria-label', `Подразделы: ${heading.text}`);
      button.setAttribute('aria-controls', list.id);
      button.setAttribute('aria-expanded', String(expanded.has(heading.slug)));
      const icon = document.createElement('span');
      icon.className = 'toc-chevron';
      icon.setAttribute('aria-hidden', 'true');
      button.append(icon);
      row.append(button);
      for (const child of children) {
        const nested = document.createElement('li');
        nested.append(linkFor(child));
        list.append(nested);
      }
      item.append(list);
      list.hidden = !expanded.has(heading.slug);
    }
    fragment.append(item);
  }
  container.replaceChildren(fragment);
}
