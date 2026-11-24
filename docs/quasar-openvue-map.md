# Quasar → OpenVue: migration guide

The app moved from Quasar to [OpenVue](https://openvue.dev) (MIT fork of PrimeVue 4.5.5),
Tailwind CSS 4 and electron-vite. The design is the Figma file
**Mitarbeiter – Brifle App** (`ITIzWsHps2VkpnCX7klUgC`); page 02 *Komponenten*
holds the components below, pages 03–07 the screens.

## Build

| Before | Now |
|---|---|
| `quasar dev -m electron` | `npm run dev` (electron-vite) |
| `quasar build -m electron` | `npm run build`, installers: `npm run build:linux` / `build:win` / `build:mac` |
| `quasar.config.ts` → `electron.builder` | `electron-builder.yml` |
| boot files, `#q-app/wrappers` | plain setup in `src/main.ts` |
| `process.env.DEV`, `QUASAR_*` | `import.meta.env.DEV`, `ELECTRON_RENDERER_URL` |

Path aliases are unchanged: `src/`, `app/`, `components/`, `layouts/`, `pages/`, `assets/`, `stores/`.

## Components

Import OpenVue components per file: `import Button from 'openvue/button'`.
Icons: [`lucide-vue-next`](https://lucide.dev) (the Figma icons are Lucide shapes),
e.g. `import { Send } from 'lucide-vue-next'` → `<Send :size="18" />`.

| Quasar | Use instead | Figma |
|---|---|---|
| `q-layout`, `q-header`, `q-drawer`, `q-page-container` | `layouts/MainLayout.vue` (title bar + sidebar) – pages render only their content | MA/Titelleiste, MA/Seitenleiste |
| `q-page` | `<div class="flex flex-col gap-6 overflow-auto px-8 py-7">` (scroll container of the page) | – |
| page title rows, `BackBtn` | `components/shell/PageHeader.vue` (`path`, `title`, `subtitle`, `#actions`) | MA/Seitenkopf |
| `q-btn` | `Button` – `severity="secondary" outlined` (Sekundär), `text` (Text), `severity="danger" outlined` (Gefahr), `size="small"`; icon via `<template #icon>` | MA/Button |
| `q-btn` round/flat icon-only | `Button text rounded` + `aria-label` | – |
| `q-input` | `FormField` (label/hint/error) + `InputText` / `Textarea` / `Password` / `InputNumber`; `invalid` prop for errors | MA/Eingabe |
| `q-select` | `Select` (`options`, `option-label`, `option-value`) | MA/Auswahl |
| `q-toggle` | `ToggleSwitch` | MA/Schalter |
| `q-checkbox` | `Checkbox` (`binary`) | MA/Checkbox |
| `q-option-group`, `q-btn-toggle` | `RadioButton` group / `SelectButton` | – |
| `q-date`, `q-popup-proxy` | `DatePicker` | – |
| `q-table`, `q-td`, `q-th` | `DataTable` + `Column` (`#body`, `sortable`, `paginator`) | MA/Kopfzelle, MA/Zelle |
| `q-pagination` | `Paginator` or `DataTable paginator` | – |
| `q-stepper`, `q-step`, `q-stepper-navigation` | `components/ui/StepsHeader.vue` + one component per step + `components/ui/WizardFooter.vue` | MA/Stepper-Schritt, Fußleiste |
| `q-dialog`, `q-card` in dialogs, `v-close-popup` | `Dialog modal` with `v-model:visible` and `#footer` | MA/Dialog |
| confirm dialogs | `useConfirm()` (`ConfirmDialog` is mounted in `App.vue`) | MA/Dialog |
| `q-card` | `<section class="ma-card">` | Karte |
| `q-tabs`, `q-tab`, `q-tab-panels` | `Tabs`, `TabList`, `Tab`, `TabPanels`, `TabPanel` | – |
| `q-expansion-item` | `Accordion` / `Panel toggleable` | – |
| `q-list`, `q-item`, `q-item-section`, `q-item-label` | Tailwind: `<ul class="flex flex-col">` / `<li class="flex items-center gap-3 …">` | – |
| `q-banner` | `Message severity="info|warn|error|success"` | MA/Hinweis |
| `q-badge`, status chips | `components/ui/StatusTag.vue` (`delivered`, `read`, `post`, `processing`, `error`, `test`, `signature`) | MA/Status-Tag |
| `q-spinner` | `ProgressSpinner` (`style="width:24px;height:24px"`) | – |
| `q-tooltip` | `v-tooltip` directive (registered globally) | – |
| `q-separator` | `<hr class="border-line">` or `Divider` | – |
| `q-icon name="…"` | Lucide component | Icon/* |
| `q-avatar` | `IconBadge` (`components/ui/IconBadge.vue`) or a Tailwind circle | – |
| `q-img` | `<img>` | – |
| `q-space` | `<div class="flex-1" />` | – |
| `q-toolbar` | `<div class="flex items-center gap-2">` | – |
| file inputs, drag & drop | `components/ui/FileDrop.vue` (emits `files`) | MA/Dateiablage |
| home tiles / KPIs | `components/ui/ActionTile.vue`, `components/ui/KpiCard.vue` | MA/Kachel, MA/Kennzahl |
| empty lists | `components/ui/EmptyState.vue` | – |
| update banner | `components/ui/UpdateBanner.vue` | MA/Update-Banner |

### Plugins and helpers

| Quasar | Now |
|---|---|
| `this.$q.notify({ type, message })` / `useQuasar().notify` | `useNotify()` from `src/composables/useNotify` → `.success(title, { detail })`, `.error(…)`, `.info(…)`, `.warn(…)`. In Options API: `setup() { return { notify: useNotify() } }`, then `this.notify.success(…)` |
| `copyToClipboard` from `quasar` | `copyToClipboard` from `src/composables/useClipboard` |
| `$q.dark` | `useTheme()` from `src/composables/useTheme` |
| `v-ripple` | remove |

## Styling

Tailwind utilities with the design tokens of `src/css/app.css` – never raw hex values:

| Token | Tailwind | Use |
|---|---|---|
| Hintergrund/Seite, Fläche, Dezent, Mint | `bg-seite`, `bg-flaeche`, `bg-dezent`, `bg-mint` | page, cards, subtle areas, selected/brand-soft |
| Hintergrund/Marke, Marke-Stark, Highlight | `bg-brand`, `bg-brand-strong`, `bg-highlight` | primary actions, title bar, accents |
| Warnung, Fehler, Info (soft) | `bg-warn-soft`, `bg-danger-soft`, `bg-info-soft` | notices |
| Text/Primär, Sekundär, Marke | `text-ink`, `text-ink-muted`, `text-brand-ink` | text |
| Text auf Marke / Highlight | `text-on-brand`, `text-on-brand-strong`, `text-on-highlight` | text on filled backgrounds |
| Fehler, Info text | `text-danger`, `text-info` | |
| Icon/Marke | `text-icon-brand` | brand icons |
| Rahmen/Standard, Marke | `border-line`, `border-line-brand` | borders |

Type styles (Figma `MA/*`): `ma-title-xl` (28 Figtree), `ma-title-l` (20), `ma-title-m` (16),
body is the default (14 Inter), `ma-text-strong`, `ma-small` (12), `ma-label` (12 semibold).
Spacing: page padding `px-8 py-7`, gaps 16/24, cards `ma-card` (12px radius, 24px padding).
Dark mode follows automatically (tokens switch under `.app-dark`); do not add `dark:` variants.

## Texts

New and rewritten texts go through vue-i18n. Each area has its own file
`src/i18n/{de-DE,en-US}/<area>.ts` (`shell`, `home`, `access`, `outbox`, `send`, `bulk`,
`settings`), addressed as `t('ui.<area>.…')`. German first; English must have the same keys.
Old keys stay in `legacy.ts` and may still be used.

## Code

New components use `<script setup lang="ts">`. Existing page logic may stay in the
Options API; rewrite the template and styles, keep the behaviour (IPC calls through
`window.*Api`, stores, router). Remove `<style>` blocks that only patched Quasar.
