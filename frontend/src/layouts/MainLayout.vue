<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-100 to-white text-gray-800"
  >
    <header class="bg-white bg-opacity-90 shadow p-4 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto flex justify-between items-center px-4 relative">
        <div class="flex items-center gap-4">
          <div class="text-lg font-semibold">DNS Logovi</div>
          <router-link
            to="/blocked"
            class="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow"
          >
            Blokirani domeni
          </router-link>
        </div>
        <button
          @click="logout"
          class="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Odjava
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6">
      <slot />
    </main>

    <footer class="text-center text-sm text-gray-500 py-4 border-t mt-8">
      <div>
        &copy; {{ new Date().getFullYear() }} Informacioni sistem Opšte bolnice
        Bor
      </div>
      <div class="mt-1 text-xs text-gray-400">Verzija: {{ appVersion }}</div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const appVersion = import.meta.env.VITE_APP_VERSION || "1.0.0";

function logout() {
  localStorage.removeItem("jwt");
  router.push("/login");
}
</script>
