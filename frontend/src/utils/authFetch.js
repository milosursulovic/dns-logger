// src/utils/authFetch.js
import router from "@/router";
import { isTokenExpired, safeRedirectToLogin } from "@/router";

export async function fetchWithAuth(path, options = {}) {
  const token = localStorage.getItem("jwt");

  // Proaktivno
  if (!token || isTokenExpired(token)) {
    safeRedirectToLogin(router, router.currentRoute.value.fullPath);
    return Promise.reject(new Error("Unauthorized: missing/expired token"));
  }

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      ...options,
      headers,
    });

    // Reaktivno
    if (res.status === 401) {
      safeRedirectToLogin(router, router.currentRoute.value.fullPath);
      return Promise.reject(new Error("Unauthorized: 401 from API"));
    }

    return res;
  } catch (err) {
    return Promise.reject(err);
  }
}
