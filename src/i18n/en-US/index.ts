import legacy from './legacy';
import shell from './shell';
import home from './home';
import access from './access';
import outbox from './outbox';
import send from './send';
import bulk from './bulk';
import settings from './settings';

export default {
  ...legacy,
  ui: { shell, home, access, outbox, send, bulk, settings },
};
