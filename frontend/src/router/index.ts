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

  // Strip Clerk redirect params after landing to avoid re-navigation loops
  Router.afterEach((to) => {
    const hasClerkParams = 'after_sign_in_url' in to.query || 'after_sign_up_url' in to.query || 'redirect_url' in to.query
    if (hasClerkParams) {
      // Remove only Clerk-specific params, keep the path
      const cleanedQuery = { ...to.query }
      delete (cleanedQuery as Record<string, unknown>)['after_sign_in_url']
      delete (cleanedQuery as Record<string, unknown>)['after_sign_up_url']
      delete (cleanedQuery as Record<string, unknown>)['redirect_url']
      // If no other params remain, replace with same path without query
      const hasOtherParams = Object.keys(cleanedQuery).length > 0
      if (hasOtherParams) {
        void Router.replace({ path: to.path, query: cleanedQuery })
      } else {
        void Router.replace({ path: to.path })
      }
    }
  })

  return Router;
});
