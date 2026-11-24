import { ref } from 'vue';

export type ThemeChoice = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'brifle.theme';
const choice = ref<ThemeChoice>('system');
const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function apply() {
  const dark = choice.value === 'dark' || (choice.value === 'system' && !!media?.matches);
  document.documentElement.classList.toggle('app-dark', dark);
}

/** Reads the saved choice and follows the OS while it is "system". Call once before mounting. */
export function applyStoredTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  choice.value = saved === 'light' || saved === 'dark' ? saved : 'system';
  media?.addEventListener('change', apply);
  apply();
}

/** Theme switch for Einstellungen → Darstellung. */
export function useTheme() {
  return {
    choice,
    setChoice: (value: ThemeChoice) => {
      choice.value = value;
      localStorage.setItem(STORAGE_KEY, value);
      apply();
    },
  };
}
