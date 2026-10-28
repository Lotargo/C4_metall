export function implementationPath(id) {
  return `/implementation/${id.split('/').map(encodeURIComponent).join('/')}/`;
}

// Source Markdown stays verbatim; only the website resolves its original names.
export function implementationSourceId(id) {
  return {
    '00-ОБЩИЙ_ПЛАН_2026-10-27': 'general-plan',
    '14-ПЛАН_UI_UX_ПАСПОРТА_2026-10-26': 'workspace-uiux',
    '15-ПЛАН_РУЧНОГО_ПОДТВЕРЖДЕНИЯ_ЭТАПОВ_2026-10-27': 'operator-review',
    '16-ПЛАН_ИНЖЕНЕРНЫХ_РАСЧЁТОВ_2026-10-27': 'engineering-calculations',
  }[id] || id;
}
