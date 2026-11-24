// Texts of the redesign, area "home" (t('ui.home.…')). One file per area so parallel work does not collide.
export default {
  title: 'Willkommen bei Brifle',
  tiles: {
    send: { title: 'Brief versenden', text: 'Ein PDF an eine Person oder Firma senden – mit Empfängerprüfung und Postversand als Rückfall.', link: 'Einzelversand' },
    bulk: { title: 'Massenversand', text: 'Viele Dokumente aus Ordner, SFTP oder CSV zuordnen und auf einmal senden.', link: 'Starten' },
    templates: { title: 'Vorlage ausführen', text: 'Gespeicherte Abläufe für wiederkehrende Sendungen mit einem Klick starten.', link: 'Vorlagen' },
    receiverCheck: { title: 'Empfänger prüfen', text: 'Liste laden und sehen, wer über Brifle erreichbar ist.', link: 'Prüfen' },
  },
  recent: {
    title: 'Letzte Sendungen',
    all: 'Zum Postausgang',
    emptyTitle: 'Noch keine Sendungen',
    emptyText: 'Gesendete Briefe erscheinen hier und im Postausgang.',
  },
  kpi: {
    total: 'Im Postausgang',
    totalHint: 'Gesendete Dokumente insgesamt',
  },
} as const;
