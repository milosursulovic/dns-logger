// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import BloockedDomainsView from "../views/BlockedDomainsView.vue";
import NotFoundView from "../views/NotFoundView.vue";

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() > payload.exp * 1000;
  } catch {
    return true; // nevalidan token tretiramo kao istekao
  }
}

let redirectingToLogin = false;
function safeRedirectToLogin(router, returnTo = "/") {
  if (redirectingToLogin) return;
  redirectingToLogin = true;
  localStorage.removeItem("jwt");
  const q = encodeURIComponent(returnTo || "/");
  if (router.currentRoute.value.path !== "/login") {
    router.push(`/login?returnTo=${q}`).finally(() => {
      redirectingToLogin = false;
    });
  } else {
    redirectingToLogin = false;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: HomeView, meta: { requiresAuth: true } },
    {
      path: "/blocked",
      component: BloockedDomainsView,
      meta: { requiresAuth: true },
    },
    { path: "/login", name: "login", component: LoginView },
    { path: "/:pathMatch(.*)*", name: "not-found", component: NotFoundView },
  ],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("jwt");
  const expired = token ? isTokenExpired(token) : true;

  if (to.meta.requiresAuth && (!token || expired)) {
    safeRedirectToLogin(router, to.fullPath);
    return; // prekini navigaciju, jer ćemo preusmeriti
  }

  next();
});

export default router;
export { isTokenExpired, safeRedirectToLogin };
