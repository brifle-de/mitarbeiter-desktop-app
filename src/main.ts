import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import OpenVue from 'openvue/config';
import ToastService from 'openvue/toastservice';
import ConfirmationService from 'openvue/confirmationservice';
import Tooltip from 'openvue/tooltip';

import '@fontsource-variable/inter';
import '@fontsource-variable/figtree';
import 'src/css/app.css';

import App from './App.vue';
import router from 'src/router';
import messages from 'src/i18n';
import BriflePreset from 'src/theme/brifle-preset';
import { applyStoredTheme } from 'src/composables/useTheme';
import { installConsoleForwarding } from 'src/utils/consoleForward';
import 'src/utils/pdfWorker';

installConsoleForwarding();
applyStoredTheme();

const i18n = createI18n({
  legacy: false,
  locale: 'de-DE',
  fallbackLocale: 'de-DE',
  messages,
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(OpenVue, {
  theme: {
    preset: BriflePreset,
    // .app-dark is set by useTheme (system, light or dark)
    options: { darkModeSelector: '.app-dark', cssLayer: false },
  },
});
app.use(ToastService);
app.use(ConfirmationService);
app.directive('tooltip', Tooltip);

// platform class on <body> (used for the macOS title bar inset)
void window.electronApi.getPlatform().then((platform: string) => document.body.classList.add(platform));

app.mount('#app');
