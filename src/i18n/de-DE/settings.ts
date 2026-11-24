// Texts of the redesign, area "settings" (t('ui.settings.…')). One file per area so parallel work does not collide.
export default {
  path: 'Einstellungen',
  updates: {
    title: 'Updates',
    subtitle: 'Brifle Business aktualisiert sich selbst über GitHub Releases.',
    version: 'Version',
    installed: 'Installiert',
    available: 'Verfügbar',
    none: 'aktuell',
    state: { idle: 'Aktuell', checking: 'Wird geprüft …', available: 'Gefunden', downloading: 'Wird geladen', ready: 'Bereit zur Installation', error: 'Fehler' },
    lastError: 'Letzter Fehler',
    unsupported: 'Diese Installation aktualisiert sich nicht selbst (Entwicklungsversion oder Linux ohne AppImage/.deb).',
    checkNow: 'Jetzt prüfen',
    releaseNotes: 'Änderungen ansehen',
    channel: 'Kanal',
    channelText: 'Im Testkanal erhältst du Vorabversionen (Release Candidates), bevor sie für alle freigegeben werden.',
    testChannel: 'Testkanal (Vorabversionen)',
    infoTitle: 'Gut zu wissen',
    infoText: 'Updates werden im Hintergrund geladen und erst beim Beenden oder auf Klick installiert. Die App startet nie von selbst neu.',
  },
  appearance: {
    title: 'Darstellung',
    subtitle: 'Wähle Hell, Dunkel oder folge der Einstellung des Systems.',
    system: 'Wie das System',
    light: 'Hell',
    dark: 'Dunkel',
  },
} as const;
