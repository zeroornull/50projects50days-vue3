import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/day01',
    },
    {
      path: '/day01',
      name: 'day01',
      meta: {
        title: 'Expanding Cards',
      },
      component: () => import('~/views/Day01_ExpandingCards/index.vue'),
    },
  ],
})

export default router
