// Texts of the redesign, area "home" (t('ui.home.…')). One file per area so parallel work does not collide.
export default {
  title: 'Welcome to Brifle',
  tiles: {
    send: { title: 'Send a letter', text: 'Send a PDF to a person or company – with receiver check and postal delivery as fallback.', link: 'Single send' },
    bulk: { title: 'Bulk sending', text: 'Match many documents from a folder, SFTP or CSV and send them at once.', link: 'Start' },
    templates: { title: 'Run a template', text: 'Start saved workflows for recurring mailings with one click.', link: 'Templates' },
    receiverCheck: { title: 'Check receivers', text: 'Load a list and see who can be reached via Brifle.', link: 'Check' },
  },
  recent: {
    title: 'Recent mailings',
    all: 'Go to outbox',
    emptyTitle: 'No mailings yet',
    emptyText: 'Sent letters show up here and in the outbox.',
  },
  kpi: {
    total: 'In the outbox',
    totalHint: 'Sent documents in total',
  },
} as const;
