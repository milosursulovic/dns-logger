<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">DNS Logovi</h1>

    <div class="mb-4">
      <input
        v-model="searchQuery"
        @input="handleSearch"
        type="text"
        placeholder="Pretraži po domenu..."
        class="w-full max-w-md px-4 py-2 border rounded-md"
      />
    </div>

    <div class="overflow-x-auto rounded-lg shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">
              #
            </th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">
              Domain
            </th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">
              IP
            </th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">
              Vreme
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr v-for="(entry, index) in domains" :key="entry._id">
            <td class="px-4 py-2 text-sm text-gray-700">
              {{ (page - 1) * limit + index + 1 }}
            </td>
            <td class="px-4 py-2 text-sm text-gray-900">{{ entry.name }}</td>
            <td class="px-4 py-2 text-sm text-gray-700">{{ entry.ip }}</td>
            <td class="px-4 py-2 text-sm text-gray-500">
              {{ formatTimestamp(entry.timestamp) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between mt-4">
      <button
        @click="prevPage"
        :disabled="page === 1"
        class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Prethodna
      </button>
      <span>Strana {{ page }} / {{ totalPages }}</span>
      <button
        @click="nextPage"
        :disabled="page >= totalPages"
        class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Sledeća
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const apiUrl = import.meta.env.VITE_API_URL;
const domains = ref([]);
const searchQuery = ref("");
const page = ref(1);
const limit = 20;
const total = ref(0);

const formatTimestamp = (ts) => new Date(ts).toLocaleString("sr-RS");
const totalPages = computed(() => Math.ceil(total.value / limit));

async function fetchDomains() {
  try {
    const url = `${apiUrl}/api/domains?page=${
      page.value
    }&limit=${limit}&search=${encodeURIComponent(searchQuery.value)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Neuspešan odgovor sa servera");
    const data = await res.json();
    domains.value = data.data;
    total.value = data.total;
  } catch (err) {
    console.error("Greška pri dohvatanju podataka:", err);
  }
}

function handleSearch() {
  page.value = 1;
  fetchDomains();
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++;
    fetchDomains();
  }
}

function prevPage() {
  if (page.value > 1) {
    page.value--;
    fetchDomains();
  }
}

onMounted(() => {
  document.title = "Početna - DNS Logovi";
  fetchDomains();
});
</script>
