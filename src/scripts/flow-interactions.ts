export {};

type FlowNode = { id: string; kind: string; title: string; who: string };
type FlowEdge = { from: string; to: string; label?: string; dashed?: boolean };
type FlowGraph = { nodes: FlowNode[]; edges: FlowEdge[]; order: string[] };
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll<HTMLElement>('[data-flow-graph]').forEach((figure) => {
  const graph: FlowGraph = JSON.parse(figure.dataset.flowGraph!);
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  let selected: string | null = null;
  let kind = 'all';
  const selection = figure.querySelector<HTMLElement>('[data-flow-selection]')!;
  const selectionHome = selection.parentElement!;
  const title = figure.querySelector<HTMLElement>('[data-flow-title]')!;
  const who = figure.querySelector<HTMLElement>('[data-flow-who]')!;
  const compact = matchMedia('(max-width: 760px)');
  let manualView = false;
  const placeSelection = () => {
    if (figure.dataset.flowView === 'steps' && selected) {
      const step = [...figure.querySelectorAll<HTMLElement>('.flow-list-select')].find((element) => element.dataset.flowNode === selected);
      step?.closest('li')?.append(selection);
    } else selectionHome.append(selection);
  };

  const setView = (view: string) => {
    figure.dataset.flowView = view;
    figure.querySelectorAll<HTMLElement>('[data-flow-view-button]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.flowViewButton === view)));
    placeSelection();
  };
  setView(compact.matches ? 'steps' : 'diagram');
  compact.addEventListener('change', () => { if (!manualView) setView(compact.matches ? 'steps' : 'diagram'); });

  const paintSelection = () => {
    const related = new Set<string>(selected ? [selected] : []);
    if (selected) for (const edge of graph.edges) {
      if (edge.from === selected) related.add(edge.to);
      if (edge.to === selected) related.add(edge.from);
    }
    figure.querySelectorAll<HTMLElement | SVGElement>('[data-flow-node]').forEach((element) => {
      const id = element.dataset.flowNode!;
      const active = selected === id;
      element.setAttribute('aria-pressed', String(active));
      element.classList.toggle('is-active', active);
      element.classList.toggle('is-muted', selected ? !related.has(id) : kind !== 'all' && nodes.get(id)?.kind !== kind);
    });
    figure.querySelectorAll<SVGElement>('[data-flow-from]').forEach((edge) => {
      const from = edge.dataset.flowFrom!, to = edge.dataset.flowTo!;
      const active = selected ? from === selected || to === selected : kind !== 'all' && (nodes.get(from)?.kind === kind || nodes.get(to)?.kind === kind);
      edge.classList.toggle('is-active', !!active);
      edge.classList.toggle('is-muted', !!selected && !active || !selected && kind !== 'all' && !active);
    });
    figure.querySelectorAll<HTMLElement>('[data-flow-kind]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.flowKind === kind)));
  };
  const connections = (direction: 'incoming' | 'outgoing', id: string) => {
    const container = figure.querySelector<HTMLElement>(`[data-flow-${direction}]`)!;
    const edges = graph.edges.filter((edge) => direction === 'incoming' ? edge.to === id : edge.from === id);
    const content = document.createDocumentFragment();
    for (const edge of edges) {
      const target = nodes.get(direction === 'incoming' ? edge.from : edge.to)!;
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.flowNeighbor = target.id;
      button.textContent = (edge.label ? edge.label + ' · ' : '') + target.title + (edge.dashed ? ' · по необходимости' : '');
      content.append(button);
    }
    if (!edges.length) {
      const text = document.createElement('span');
      text.className = 'flow-endpoint';
      text.textContent = direction === 'incoming' ? 'Начало схемы' : 'Завершение схемы';
      content.append(text);
    }
    container.replaceChildren(content);
  };
  const select = (id: string | null) => {
    selected = id;
    placeSelection();
    selection.hidden = !id;
    if (id) {
      const node = nodes.get(id)!;
      title.textContent = node.title;
      who.textContent = node.who;
      who.className = 'badge flow-who-' + node.kind;
      connections('incoming', id);
      connections('outgoing', id);
      if (!reducedMotion.matches) selection.animate([{ opacity: .3, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 200, easing: 'ease-out' });
    }
    paintSelection();
  };
  const clearSelection = () => {
    const previous = selected;
    select(null);
    const selector = figure.dataset.flowView === 'steps' ? '.flow-list-select' : '.flow-node';
    const previousControl = [...figure.querySelectorAll<HTMLElement | SVGElement>(selector)].find((element) => element.dataset.flowNode === previous);
    previousControl?.focus({ preventScroll: true });
  };
  figure.addEventListener('click', (event) => {
    const target = event.target as Element;
    const view = target.closest<HTMLElement>('[data-flow-view-button]');
    if (view) { manualView = true; setView(view.dataset.flowViewButton!); return; }
    const filter = target.closest<HTMLElement>('[data-flow-kind]');
    if (filter) { kind = filter.dataset.flowKind!; select(null); return; }
    if (target.closest('[data-flow-clear]')) { clearSelection(); return; }
    const neighbor = target.closest<HTMLElement>('[data-flow-neighbor]');
    const node = target.closest<HTMLElement | SVGElement>('[data-flow-node]');
    if (neighbor) {
      select(neighbor.dataset.flowNeighbor!);
      title.tabIndex = -1;
      title.focus({ preventScroll: true });
      if (figure.dataset.flowView === 'steps') title.scrollIntoView({ block: 'nearest', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
    else if (node) select(selected === node.dataset.flowNode ? null : node.dataset.flowNode!);
  });
  figure.addEventListener('keydown', (event) => {
    const node = (event.target as Element).closest<SVGElement>('.flow-node[data-flow-node]');
    if (event.key === 'Escape' && selected) { event.preventDefault(); event.stopPropagation(); clearSelection(); return; }
    if (!node) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); event.stopPropagation(); select(selected === node.dataset.flowNode ? null : node.dataset.flowNode!);
    }
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    const current = graph.order.indexOf(node.dataset.flowNode!);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? graph.order.length - 1 : (current + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + graph.order.length) % graph.order.length;
    const buttons = [...figure.querySelectorAll<SVGElement>('.flow-node[data-flow-node]')];
    const nextNode = buttons.find((element) => element.dataset.flowNode === graph.order[next]);
    buttons.forEach((element) => element.setAttribute('tabindex', element === nextNode ? '0' : '-1'));
    nextNode?.focus();
  });
});
