import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresUnseal: true },
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/settings',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresUnseal: true },
    children: [
      { path: '', component: () => import('pages/settings/Index.vue') },
      {
        path: 'account',
        component: () => import('pages/settings/Account.vue'),  
      },
      {
        path: 'parsers',
        component: () => import('pages/settings/Parsers.vue'),
      },
      {
        path: 'parsers/receiver-records',
        component: () => import('pages/settings/parsers/receiversFiles.vue'),
      }
    ],
  },
  {
    path: '/outbox',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresUnseal: true },
    children: [
      {
        path: '',
        component: () => import('pages/outbox/Index.vue'),
      }
    ]
  },
  {
    path: '/bulk_sending',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresUnseal: true },
    children: [
      {
        path: '',
        component: () => import('pages/bulk_sending/Index.vue'),
      }
    ]
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
