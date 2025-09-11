import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/AppLayout.vue'),
    children: [
      { 
        path: '', 
        name: 'home',
        component: () => import('pages/IndexPage.vue') 
      },
      { 
        path: 'projects', 
        name: 'projects',
        component: () => import('pages/ProjectsPage.vue') 
      },
      { 
        path: 'projects/create', 
        name: 'project-create',
        component: () => import('pages/ProjectCreatePage.vue'),
        meta: { requiresAuth: true }
      },
      { 
        path: 'projects/:id', 
        name: 'project-detail',
        component: () => import('pages/ProjectDetailPage.vue') 
      },
      { 
        path: 'profile', 
        name: 'profile',
        component: () => import('pages/ProfilePage.vue'),
        meta: { requiresAuth: true }
      },
    ],
  },
  {
    path: '/auth/sign-in',
    name: 'sign-in',
    component: () => import('pages/AuthSignInPage.vue'),
  },
  {
    path: '/auth/sign-up',
    name: 'sign-up',
    component: () => import('pages/AuthSignUpPage.vue'),
  },
  {
    path: '/checkout/success',
    name: 'checkout-success',
    component: () => import('pages/CheckoutReturnPage.vue'),
  },
  {
    path: '/checkout/cancel',
    name: 'checkout-cancel',
    component: () => import('pages/CheckoutReturnPage.vue'),
  },
  {
    path: '/404',
    name: 'not-found',
    component: () => import('pages/NotFoundPage.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    redirect: '/404',
  },
];

export default routes;
