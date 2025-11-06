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
      { path: 'dashboard/campaigns', component: () => import('pages/DashboardCampaigns.vue') },
      { path: 'dashboard/contributions', component: () => import('pages/DashboardContributions.vue') },
      { path: 'projects/new', component: () => import('pages/NewProject.vue') },
      { path: 'favorites', component: () => import('pages/FavoritesPage.vue') },
      { path: 'projects/:id', component: () => import('pages/ProjectDetail.vue') },
      { path: 'contrib/success', component: () => import('pages/ContribSuccess.vue') },
      { path: 'contrib/cancel', component: () => import('pages/ContribCancel.vue') },
      { path: 'subscribe/success', component: () => import('pages/SubscribeSuccess.vue') },
      { path: 'subscribe/cancel', component: () => import('pages/SubscribeCancel.vue') },
      { path: 'subscriptions', component: () => import('pages/SubscriptionsPage.vue') },
      { path: 'connect/return', component: () => import('pages/ConnectReturn.vue') },
      { path: 'connect/refresh', component: () => import('pages/ConnectRefresh.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
      { path: 'help', component: () => import('pages/SupportCenter.vue') },
      { path: 'contact', component: () => import('pages/ContactPage.vue') },
      { path: 'faq', component: () => import('pages/FaqPage.vue') },
      { path: 'guides', component: () => import('pages/GuidesPage.vue'), meta: { breadcrumb: 'Guias' } },
      { path: 'guides/prepare', component: () => import('pages/GuidePrepare.vue'), meta: { breadcrumb: 'Como preparar a página' } },
      { path: 'guides/promotion', component: () => import('pages/GuidePromotion.vue'), meta: { breadcrumb: 'Melhores práticas de divulgação' } },
      { path: 'guides/goal-deadline', component: () => import('pages/GuideGoalDeadline.vue'), meta: { breadcrumb: 'Meta e prazo' } },
      { path: 'guides/trust', component: () => import('pages/GuideTrust.vue'), meta: { breadcrumb: 'Construindo confiança' } },
      { path: 'privacy', component: () => import('pages/PrivacyPolicy.vue'), meta: { breadcrumb: 'Política de Privacidade' } },
      { path: 'terms', component: () => import('pages/TermsOfUse.vue'), meta: { breadcrumb: 'Termos de Uso' } },
      { path: 'cookies', component: () => import('pages/CookiesPolicy.vue'), meta: { breadcrumb: 'Política de Cookies' } },
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
