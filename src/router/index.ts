import { createRouter, createWebHashHistory } from 'vue-router';
import routes from './routes';
import UnsealGuard from 'src/utils/unsealGuard';

// Hash history: the renderer is loaded from a file:// URL in packaged builds.
const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresUnseal)) {
    return await UnsealGuard.checkUnseal(to, from, next);
  }
  return next();
});

export default router;
