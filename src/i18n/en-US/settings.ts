// Texts of the redesign, area "settings" (t('ui.settings.…')). One file per area so parallel work does not collide.
export default {
  path: 'Settings',
  updates: {
    title: 'Updates',
    subtitle: 'Brifle Business updates itself from GitHub Releases.',
    version: 'Version',
    installed: 'Installed',
    available: 'Available',
    none: 'up to date',
    state: { idle: 'Up to date', checking: 'Checking …', available: 'Found', downloading: 'Downloading', ready: 'Ready to install', error: 'Error' },
    lastError: 'Last error',
    unsupported: 'This installation does not update itself (development build, or Linux without AppImage/.deb).',
    checkNow: 'Check now',
    releaseNotes: 'View changes',
    channel: 'Channel',
    channelText: 'On the test channel you receive pre-releases (release candidates) before everyone else.',
    testChannel: 'Test channel (pre-releases)',
    infoTitle: 'Good to know',
    infoText: 'Updates download in the background and are installed when you quit or click. The app never restarts on its own.',
  },
  appearance: {
    title: 'Appearance',
    subtitle: 'Choose light, dark, or follow the system setting.',
    system: 'Like the system',
    light: 'Light',
    dark: 'Dark',
  },
} as const;
