import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/Home.vue') },
    { path: '/sign-in', name: 'sign-in', component: () => import('../views/Signin.vue') },
    { path: '/sign-up', name: 'sign-up', component: () => import('../views/Signup.vue') },
    // Rota protegida simples: o componente faz o redirect ao SignIn quando não logado
    { path: '/dashboard', name: 'dashboard', component: () => import('../views/Dashboard.vue') }
  ]
})
