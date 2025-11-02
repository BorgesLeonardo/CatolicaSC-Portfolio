import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Simple auth guard using Clerk global to protect routes with meta.requiresAuth
  Router.beforeEach((to) => {
    const requiresAuth = to.matched.some(r => (r.meta as unknown as { requiresAuth?: boolean })?.requiresAuth)
    if (!requiresAuth) return true

    const w = (typeof window !== 'undefined' ? window : undefined) as unknown as { Clerk?: { user?: unknown } } | undefined
    const isSignedIn = !!w?.Clerk?.user
    if (isSignedIn) return true

    return { path: '/sign-in', query: { redirect: to.fullPath } }
  })

  return Router;
});
