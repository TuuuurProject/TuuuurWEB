import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
// import useUserStore from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'tableau-de-bord',
    component: () => import('../views/TableauDeBordPage.vue'),
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
