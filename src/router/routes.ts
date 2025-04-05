import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresUnseal: true },
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/unseal',
    component: () => import('layouts/SimpleLayout.vue'),
    children: [{ path: '', component: () => import('pages/unseal/Index.vue') }],
  },
  {
    path: '/accounts',
    component: () => import('layouts/SimpleLayout.vue'),
    meta: { requiresUnseal: true },
    children: [
      {
        path: '',
        component: () => import('pages/accounts/Index.vue'),
      },
      {
        path: 'create',
        component: () => import('pages/accounts/Create.vue'),
      }
    ]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
