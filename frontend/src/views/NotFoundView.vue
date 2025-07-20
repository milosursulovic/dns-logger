<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-white text-center px-4"
  >
    <h1
      class="text-7xl font-extrabold text-red-600 mb-3 tracking-wide drop-shadow"
    >
      404
    </h1>
    <p class="text-xl text-gray-700 mb-5">Stranica nije pronađena</p>

    <router-link
      to="/"
      class="bg-blue-600 text-white px-6 py-2 rounded-full shadow hover:bg-blue-700 transition"
    >
      ⬅️ Nazad na početnu
    </router-link>

    <p class="text-center text-xs text-slate-500 mt-6">
      Verzija: {{ appVersion }}
    </p>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

const appVersion = import.meta.env.VITE_APP_VERSION || "1.0.0";

onMounted(() => {
  document.title = `Stranica nije pronađena - DNS Logovi`;
});
</script>
