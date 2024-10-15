import { createRouter, createWebHistory } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", component: () => import("../pages/Home.vue") },
        { path: "/Registration", component: () => import("../pages/Registration.vue") },
        { path: "/Login", component: () => import("../pages/Login.vue") },
        { 
            path: "/Recipe", 
            component: () => import("../pages/Recipe.vue"),
            meta: {
                requiresAuth: true,
            },
        },
        
    ],
});

const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const removeListener = onAuthStateChanged(
            getAuth(),
            (user) => {
                removeListener();
                resolve(user);
            },
            reject
        )
    })
}

router.beforeEach(async (to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (await getCurrentUser()) {
            next();
        }
    } else {
        alert("You don't have access!");
        next("/");
    }
});

export default router;