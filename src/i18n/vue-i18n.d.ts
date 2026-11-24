import type messages from 'src/i18n';
type MessageSchema = typeof messages['de-DE'];
/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */
