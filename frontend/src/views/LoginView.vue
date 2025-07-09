<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-semibold mb-6 text-center">🔐 Prijava</h1>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <input
          v-model="username"
          type="text"
          placeholder="Korisničko ime"
          class="w-full px-4 py-2 border rounded"
          required
        />
        <input
          v-model="password"
          type="password"
          placeholder="Lozinka"
          class="w-full px-4 py-2 border rounded"
          required
        />
        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Prijavi se
        </button>
      </form>
      <p v-if="error" class="text-red-600 mt-4 text-sm text-center">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const apiUrl = import.meta.env.VITE_API_URL;
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
  document.title = "Prijava - DNS Logger";
});
</script>
