import { createRouter, createWebHistory } from 'vue-router';
import MapView from './components/MapView.vue';
import TaskView from './components/TaskView.vue';
import HomeView from './components/HomeView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/map', component: MapView },
  { path: '/tasks', component: TaskView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
