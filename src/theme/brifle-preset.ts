import { definePreset } from '@openvue/themes';
import Aura from '@openvue/themes/aura';

/**
 * Brifle corporate design on top of OpenVue's Aura (PrimeVue fork).
 * Values mirror the `Farben` collection of the corporate design library
 * (modes "Hell" and "Dunkel gedämpft"); src/styles/main.css holds the same
 * tokens as CSS variables for our own components.
 */
const BriflePreset = definePreset(Aura, {
  components: {
    // MA/Button Sekundär: readable text and border (Aura's outlined secondary
    // is too faint, in dark mode it looks disabled)
    button: {
      colorScheme: {
        light: {
          outlined: { secondary: { color: '#131f21', borderColor: '#d1ded6', hoverBackground: '#e7f4ea', activeBackground: '#d0f0da' } },
          text: { secondary: { color: '#131f21' } },
        },
        dark: {
          outlined: { secondary: { color: '#e3eae5', borderColor: '#3a4a41', hoverBackground: '#1f2924', activeBackground: '#27332d' } },
          text: { secondary: { color: '#e3eae5' } },
        },
      },
    },
    // MA/Kopfzelle: header row on Hintergrund/Dezent, 12px semibold titles
    datatable: {
      headerCell: { padding: '10px 16px' },
      bodyCell: { padding: '12px 16px' },
      columnTitle: { fontWeight: '600' },
      colorScheme: {
        light: { headerCell: { background: '#e7f4ea', color: '#546360' } },
        dark: { headerCell: { background: '#1f2924', color: '#9fb0a7' } },
      },
    },
  },
  semantic: {
    primary: {
      50: '#f6faf6',
      100: '#e7f4ea',
      200: '#d0f0da',
      300: '#aae2bf',
      400: '#63c88e',
      500: '#1b8e5a',
      600: '#157a4c',
      700: '#0b4a32',
      800: '#0a402d',
      900: '#093728',
      950: '#062419',
    },
    borderRadius: { none: '0', xs: '4px', sm: '8px', md: '8px', lg: '16px', xl: '24px' },
    formField: { borderRadius: '8px' },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f6faf6',
          100: '#e7f4ea',
          200: '#d1ded6',
          300: '#b7c6bd',
          400: '#8fa096',
          500: '#6b7b75',
          600: '#546360',
          700: '#3a4744',
          800: '#26302f',
          900: '#131f21',
          950: '#0b1314',
        },
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        highlight: {
          background: '{primary.100}',
          focusBackground: '{primary.200}',
          color: '#131f21',
          focusColor: '#131f21',
        },
        text: { color: '#131f21', mutedColor: '#546360' },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#e3eae5',
          100: '#c8d3cc',
          200: '#9fb0a7',
          300: '#7c8d84',
          400: '#5f7067',
          500: '#465349',
          600: '#37433c',
          700: '#2c3731',
          800: '#1f2924',
          900: '#18201c',
          950: '#111714',
        },
        primary: {
          color: '#5fae86',
          contrastColor: '#13201a',
          hoverColor: '#74bd97',
          activeColor: '#8ccba9',
        },
        highlight: {
          background: '#27332d',
          focusBackground: '#2c3731',
          color: '#e3eae5',
          focusColor: '#e3eae5',
        },
        text: { color: '#e3eae5', mutedColor: '#9fb0a7' },
      },
    },
  },
});

export default BriflePreset;
