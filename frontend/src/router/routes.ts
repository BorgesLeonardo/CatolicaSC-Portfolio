import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'projects', component: () => import('pages/ProjectsPage.vue') },
      { path: 'me', component: () => import('pages/MyProjects.vue') },
      { path: 'dashboard', component: () => import('pages/AdminDashboard.vue') },
      { path: 'projects/new', component: () => import('pages/NewProject.vue') },
      { path: 'projects/:id', component: () => import('pages/ProjectDetail.vue') },
    ],
  },
  {
    path: '/sign-in',
    component: () => import('pages/AuthSignIn.vue'),
  },
  {
    path: '/sign-up',
    component: () => import('pages/AuthSignUp.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
