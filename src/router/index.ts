import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import useUserStore from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue'),
  },
  {
    path: '/solo/:id?',
    name: 'SoloQuiz',
    component: () => import('../views/SoloPage.vue'),
  },
  {
    path: '/groupe/:id?',
    name: 'GroupMode',
    component: () => import('../views/GroupModePage.vue'),
  },
  {
    path: '/competitif/:id?',
    name: 'CompetitiveMode',
    component: () => import('../views/CompetitiveModePage.vue'),
  },
  {
    path: '/profil',
    name: 'Profile',
    component: () => import('../views/ProfilePage.vue'),
  },
  {
    path: '/classement',
    name: 'Ranking',
    component: () => import('../views/RankingPage.vue'),
  },
  {
    path: '/connexion',
    name: 'Login',
    component: () => import('../views/LoginPage.vue'),
  },
  {
    path: '/inscription',
    name: 'Register',
    component: () => import('../views/RegisterPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'Home' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash === '#game-modes' || to.hash === '#how-to-play') {
      return { el: to.hash, top: 96 }
    }
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const user = useUserStore()

  // Liste des routes qui nécessitent une connexion
  const protectedRoutes = new Set(['Profile', 'SoloQuiz', 'GroupMode', 'CompetitiveMode'])

  // Sauvegarder la route uniquement si l'utilisateur n'est pas connecté
  // et tente d'accéder à une page protégée
  if (!user.isLogged && protectedRoutes.has(to.name as string)) {
    user.comeFrom = to.fullPath
  }

  if (
    user.isLogged &&
    protectedRoutes.has(from.name as string) &&
    (to.name === 'Login' || to.name === 'Register')
  ) {
    return next({ name: 'Home' })
  }

  next()
})

export default router
