import EditBulkTemplatePage from 'src/pages/bulk_sending/pages/EditBulkTemplatePage.vue';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('layouts/MainLayout.vue'),
    meta: { 
      requiresUnseal: true 
    },
    children: [
      {
        path: '', component: () => import('pages/IndexPage.vue'),
        meta: {
          searchable: false,
          title: 'Startseite',
          description: 'Willkommen bei Brifle!',
          keywords: ['Home', 'Startseite', 'Brifle'],
        }
      }
    ],
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresUnseal: true },
    children: [
      { 
        path: '', component: () => import('pages/settings/Index.vue'),
        name: 'settings.index',
        meta: {
          searchable: true,
          title: 'Einstellungen',
          description: 'Verwalten Sie Ihre Brifle-Einstellungen',
          keywords: ['Einstellungen', 'Brifle'],
        }
      },
      {
        path: 'account',
        name: 'settings.account',
        component: () => import('pages/settings/Account.vue'),  
        meta: {
          searchable: true,
          title: 'Konto',
          description: 'Verwalten Sie Ihr Brifle-Konto',
          keywords: ['Konto', 'Brifle'],
        }
      },
      {
        path: 'parsers',
        name: 'settings.parsers',
        component: () => import('pages/settings/Parsers.vue'),
        meta: {
          searchable: true,
          title: 'Parser',
          description: 'Verwalten Sie Ihre Parser-Einstellungen',
          keywords: ['Parser', 'Einstellungen', 'Brifle'],
        }
      },
      {
        path: 'cover_letters',
        name: 'settings.cover_letters',
        component: () => import('pages/settings/CoverLetters.vue'),
        meta: {
          searchable: true,
          title: 'Deckblätter',
          description: 'Verwalten Sie Ihre Anschreiben-Vorlagen',
          keywords: ['Deckblätter', 'Vorlagen', 'Brifle', 'Anschreiben', 'Cover Letters'],
        }
      },
      {
        path: 'scripts',
        name: 'settings.scripts',
        component: () => import('pages/settings/Scripts.vue'),
        meta: {
          searchable: true,
          title: 'Skripte',
          description: 'Verwalten Sie Ihre Skripte und Skriptumgebungen',
          keywords: ['Skripte', 'Scripts', 'Brifle', 'Einstellungen'],
        }
      },
      {
        path: 'scripts/view/:scriptEnvironment/:scriptName',
        name: 'settings.scripts.view',
        component: () => import('pages/settings/scripts/ScriptViewPage.vue'),
        props: true,
      },
      {
        path: 'parsers/receiver-records',
        component: () => import('pages/settings/parsers/receiversFiles.vue'),     
      }
    ],
  },
  {
    path: '/outbox',
    name: 'outbox',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresUnseal: true },
    children: [
      {
        path: '',
        name: 'outbox.index',
        component: () => import('pages/outbox/Index.vue'),
        meta: {
          searchable: true,
          title: 'Postausgang',
          description: 'Verwalten Sie Ihre ausgehenden Dokumente',
          keywords: ['Postausgang', 'Brifle', 'Dokumente'],
        }
      },      
      {
        path: 'send',
        name: 'outbox.send',
        component: () => import('pages/outbox/SendDocumentPage.vue'),
        meta: {
          searchable: true,
          searchWeight: 2,
          title: 'Dokument senden',
          description: 'Senden Sie ein neues Dokument über Brifle',
          keywords: ['Dokument senden', 'Brifle', 'Postausgang'],
        }
      },
      {
        path: ':id',
        name: 'outbox.details',
        component: () => import('pages/outbox/DetailsPage.vue'),
        meta: {
          title: 'Dokumentdetails',
          description: 'Details zu Ihrem Dokument',
          keywords: ['Dokumentdetails', 'Brifle', 'Postausgang'],
        }
      }
    ]
  },
  {
    path: '/bulk_sending',
    name: 'bulk_sending',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresUnseal: true },
    children: [
      {
        path: '',
        name: 'bulk_sending.index',
        component: () => import('pages/bulk_sending/Index.vue'),
        meta: {
          searchable: true,
          searchWeight: 3,
          title: 'Serienversand Übersicht',
          description: 'Senden Sie Dokumente an mehrere Empfänger gleichzeitig',
          keywords: ['Serienversand', 'Brifle', 'Bulk Sending'],
        }
      },
      {
        path: '/custom',
        name: 'bulk_sending.custom',
        component: () => import('pages/bulk_sending/pages/CustomBulkSendPage.vue'),
        meta: {
          searchable: true,
          searchWeight: 2,
          title: 'Individueller Serienversand',
          description: 'Passen Sie Ihren Serienversand mit benutzerdefinierten Einstellungen an',
          keywords: ['Individueller Versand', 'Individueller Serienversand', 'Massenversand', 'Individuell', 'Serienversand'],
        }
      },
      {
        path: '/templates',
        name: 'bulk_sending.templates',
        component: () => import('pages/bulk_sending/pages/TemplatesBulkSendPage.vue'),
        meta: {
          searchable: true,
          searchWeight: 2,
          title: 'Serienversand Vorlagen',
          description: 'Erstellen und verwalten Sie Vorlagen für Ihren Serienversand',
          keywords: ['Serienversand Vorlagen', 'Vorlagen', 'Brifle', 'Bulk Sending', 'Massenversand'],
        }
      },
      {
        path: '/templates/create',
        name: 'bulk_sending.create_template',
        component: () => EditBulkTemplatePage,
        meta: {
          searchable: true,
          searchWeight: 1,
          title: 'Vorlage erstellen',
          description: 'Erstellen Sie eine neue Vorlage für Ihren Serienversand',
          keywords: ['Serienversand Vorlage erstellen', 'Vorlage', 'Brifle', 'Bulk Sending'],
        }
      },
      {
        path: '/templates/edit/:id',
        name: 'bulk_sending.edit_template',
        component: EditBulkTemplatePage,
        props: true,       
      },      
      {
        path: '/templates/start/:id',
        name: 'bulk_sending.start',
        component: () => import('pages/bulk_sending/pages/UseTemplateSendPage.vue'),
        props: true,
      },
      {
        path: 'receiver_check',
        name: 'bulk_sending.receiver_check',
        component: () => import('pages/bulk_sending/ReceiverCheckPage.vue'),
        meta: {
          searchable: true,
          searchWeight: 2,
          title: 'Empfängerprüfung',
          description: 'Überprüfen Sie Ihre Empfängerliste vor dem Versand',
          keywords: ['Empfängerprüfung', 'Brifle', 'Bulk Sending'],
        }
      },
    ]
  },
  {
    path: '/unseal',
    name: 'unseal',
    component: () => import('layouts/SimpleLayout.vue'),
    children: [{ path: '', component: () => import('pages/unseal/Index.vue') }],
  },
  {
    path: '/accounts',
    name: 'accounts',
    component: () => import('layouts/SimpleLayout.vue'),
    meta: { requiresUnseal: true },
    children: [
      {
        path: '',
        name: 'accounts.index',
        component: () => import('pages/accounts/Index.vue'),       
      },
      {
        path: 'create',
        name: 'accounts.create',
        component: () => import('pages/accounts/Create.vue'),
      }
    ]
  },  
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    name: 'not-found',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export function searchRoutes(query: string): RouteRecordRaw[] {
  const searchableRoutes = routes.flatMap(route => route.children || []).filter(child => child.meta?.searchable);
  const lowerCaseQuery = query.toLowerCase().trim();
  
  if (lowerCaseQuery.length === 0) {
    return searchableRoutes;
  }
  const uniquePath: Set<string> = new Set();

  const res = searchableRoutes.filter(route => {
    console.log('Checking route:', route.path, route.meta?.title, query);
    if (uniquePath.has(route.path)) {
      return false; // Skip duplicate paths
    }
    const title = ((route.meta?.title || '') as string).toLowerCase();
    const description = ((route.meta?.description || '') as string).toLowerCase();
    const keywords = (route.meta?.keywords as string[] || []).map((k: string) => k.toLowerCase());
    const includes = title.includes(lowerCaseQuery) || description.includes(lowerCaseQuery) || keywords.some((k: string) => k.includes(lowerCaseQuery));
    if (includes) {
      uniquePath.add(route.path);
    }
    return includes;
  }).sort((a, b) => {
    const aWeight = (a.meta?.searchWeight as number) || 1;
    const bWeight = (b.meta?.searchWeight as number) || 1;
    return bWeight - aWeight; // Higher weight first
  });
  console.log('Search results:', res);
  return res;

}

export default routes;
