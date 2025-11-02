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
  Router.beforeEach(async (to) => {
    // Never block Clerk pages
    if (to.path === '/sign-in' || to.path === '/sign-up') return true

    const requiresAuth = to.matched.some(r => (r.meta as unknown as { requiresAuth?: boolean })?.requiresAuth)
    if (!requiresAuth) return true

    const w = (typeof window !== 'undefined' ? window : undefined) as unknown as { Clerk?: { user?: unknown, loaded?: Promise<void> } } | undefined
    const clerk = w?.Clerk

    // If Clerk not initialized yet, allow navigation and let pages/components handle state
    if (!clerk) return true

    try {
      // Wait for Clerk to finish loading to avoid false negatives
      const loaded = (clerk as unknown as { loaded?: unknown }).loaded as unknown
      if (typeof (loaded as { then?: unknown })?.then === 'function') {
        await (loaded as Promise<void>)
      }
    } catch {
      // ignore loading errors; fall back to unsigned check
    }

    const isSignedIn = !!clerk.user
    if (isSignedIn) return true

    return { path: '/sign-in', query: { redirect: to.fullPath } }
  })

  // Strip Clerk redirect params after landing to avoid re-navigation loops
  let isCleaning = false;

  Router.afterEach((to) => {
    if (isCleaning) return;
    const hasClerkParams = 'after_sign_in_url' in to.query || 'after_sign_up_url' in to.query || 'redirect_url' in to.query
    // Also defensively check raw hash for duplicated '#/?' or clerk params
    const rawHash = typeof window !== 'undefined' ? window.location.hash : ''
    const rawHasClerk = /[#&?](after_sign_in_url|after_sign_up_url|redirect_url)=/.test(rawHash) || rawHash.includes('#/?')
    if (hasClerkParams || rawHasClerk) {
      isCleaning = true;
      // Remove only Clerk-specific params, keep the path
      const cleanedQuery = { ...to.query }
      delete (cleanedQuery as Record<string, unknown>)['after_sign_in_url']
      delete (cleanedQuery as Record<string, unknown>)['after_sign_up_url']
      delete (cleanedQuery as Record<string, unknown>)['redirect_url']
      // If no other params remain, replace with same path without query
      const hasOtherParams = Object.keys(cleanedQuery).length > 0
      const nextLocation = hasOtherParams ? { path: to.path, query: cleanedQuery } : { path: to.path }
      void Router.replace(nextLocation).finally(() => {
        // Small delay to avoid re-entrancy if Clerk appends again immediately
        setTimeout(() => { isCleaning = false }, 100)
      })
    }
  })

  return Router;
});
