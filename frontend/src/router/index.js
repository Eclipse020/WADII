import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", component: () => import("../pages/Home.vue") },
        { path: "/Registration", component: () => import("../pages/Registration.vue") },
        { path: "/Login", component: () => import("../pages/Login.vue") },
        { path: "/Recipe", component: () => import("../pages/Recipe.vue") },
        
    ],
});

export default router;