import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
// import useUserStore from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue'),
  },
  {
    path: '/solo',
    name: 'SoloQuiz',
    component: () => import('../views/SoloPage.vue'),
  },
  {
    path: '/groupe',
    name: 'GroupMode',
    component: () => import('../views/GroupModePage.vue'),
  },
  {
    path: '/competitif',
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
    redirect: { name: 'home' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// router.beforeEach((to, from, next) => {
//   const user = useUserStore()
//   if (to.meta.mustBeAuthenticated && !user.isLogged) {
//     // window.localStorage.setItem("afterLoginRoute", JSON.stringify(to))
//     // next({name: 'login'})
//     userManager.goToLoginPage();
//   }

//   next()
// })

export default router
