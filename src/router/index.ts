import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
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
  {
    path: '/day02',
    name: 'day02',
    meta: {
      title: 'Progress Steps',
    },
    component: () => import('~/views/Day02_ProgressSteps/index.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
