<template>
  <div
    class="flex flex-col min-h-screen justify-between bg-gradient-to-br from-blue-50 to-blue-100"
  >
    <div class="flex items-center justify-center flex-1 px-4">
      <div
        class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in"
      >
        <div class="flex justify-center mb-6">
          <div class="flex items-center gap-3">
            <img :src="logo" alt="Logo" class="h-12" />
            <div class="text-2xl font-semibold text-blue-700 tracking-tight">
              DNS Logovi
            </div>
          </div>
        </div>

        <h1 class="text-xl font-medium mb-4 text-center text-gray-700">
          🔐 Prijava na sistem
        </h1>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <input
            v-model="username"
            type="text"
            placeholder="Korisničko ime"
            class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />
          <input
            v-model="password"
            type="password"
            placeholder="Lozinka"
            class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />

          <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded shadow transition"
          >
            Prijavi se
          </button>
        </form>

        <p v-if="error" class="text-red-600 mt-4 text-sm text-center">
          {{ error }}
        </p>
      </div>
    </div>

    <footer class="text-center text-sm text-gray-500 py-4 border-t bg-white">
      <div>
        &copy; {{ new Date().getFullYear() }} Informacioni sistem Opšte bolnice
        Bor
      </div>
      <div class="mt-1 text-xs text-gray-400">Verzija: {{ appVersion }}</div>
    </footer>
  </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import logo from "@/assets/logo.png";

const apiUrl = import.meta.env.VITE_API_URL;
const appVersion = import.meta.env.VITE_APP_VERSION || "1.0.0";
const username = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();

async function handleLogin() {
  try {
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    if (!res.ok) throw new Error("Neispravni podaci za prijavu");

    const data = await res.json();
    localStorage.setItem("jwt", data.token);
    router.push("/");
  } catch (err) {
    error.value = err.message;
  }
}

onMounted(() => {
  document.title = "Prijava - DNS Logovi";
});
</script>
