<template>
  <MainLayout>
    <div class="p-6 relative">
      <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
        <input v-model="searchQuery" @input="handleSearch" type="text" placeholder="Pretraži po domenu, IP adresi..."
          class="w-full sm:w-auto flex-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

        <button @click="exportExcel"
          class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-green-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 4v12m0 0l-3-3m3 3l3-3m-3 3V4m-7 8v8h14v-8" />
          </svg>
          Exportuj u Excel
        </button>
      </div>

      <div class="overflow-x-auto rounded-lg shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">
                #
              </th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 cursor-pointer"
                @click="changeSort('name')">
                Domain
                <span v-if="sortBy === 'name'">
                  {{ sortOrder === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 cursor-pointer"
                @click="changeSort('ip')">
                IP
                <span v-if="sortBy === 'ip'">
                  {{ sortOrder === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 cursor-pointer"
                @click="changeSort('timestamp')">
                Vreme
                <span v-if="sortBy === 'timestamp'">
                  {{ sortOrder === "asc" ? "↑" : "↓" }}
                </span>
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
        <button @click="prevPage" :disabled="page === 1" class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">
          Prethodna
        </button>
        <span>Strana {{ page }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="page >= totalPages"
          class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">
          Sledeća
        </button>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from "@/layouts/MainLayout.vue";
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchWithAuth } from "@/utils/authFetch";

const apiUrl = import.meta.env.VITE_API_URL;
const domains = ref([]);
const route = useRoute();
const router = useRouter();

const searchQuery = ref(route.query.search || "");
const page = ref(parseInt(route.query.page) || 1);
const sortBy = ref(route.query.sortBy || "timestamp");
const sortOrder = ref(route.query.sortOrder || "desc");
const limit = 20;
const total = ref(0);

const formatTimestamp = (ts) => new Date(ts).toLocaleString("sr-RS");
const totalPages = computed(() => Math.ceil(total.value / limit));

watch(
  [page, searchQuery, sortBy, sortOrder],
  ([newPage, newSearch, newSortBy, newSortOrder]) => {
    router.replace({
      query: {
        page: newPage,
        search: newSearch || undefined,
        sortBy: newSortBy || undefined,
        sortOrder: newSortOrder || undefined,
      },
    });
  }
);

async function fetchDomains() {
  try {
    const res = await fetchWithAuth(
      `/api/domains?page=${page.value}&limit=${limit}&search=${encodeURIComponent(
        searchQuery.value
      )}&sortBy=${sortBy.value}&sortOrder=${sortOrder.value}`
    );
    if (!res.ok) throw new Error("Neuspešan odgovor sa servera");
    const data = await res.json();
    domains.value = data.data;
    total.value = data.total;
  } catch (err) {
    console.error("Greška pri dohvatanju podataka:", err);
  }
}

async function exportExcel() {
  try {
    const res = await fetchWithAuth(
      `/api/domains/export?search=${encodeURIComponent(
        searchQuery.value
      )}&sortBy=${sortBy.value}&sortOrder=${sortOrder.value}`,
      { method: "GET" }
    );

    if (!res.ok) throw new Error("Neuspešan odgovor sa servera.");

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `dns-logovi-${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    console.error("Greška pri eksportovanju:", err);
    alert("Greška pri eksportovanju u Excel.");
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

function changeSort(field) {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = field;
    sortOrder.value = "asc";
  }
  page.value = 1;
  fetchDomains();
}

onMounted(() => {
  document.title = "Početna - DNS Logovi";
  fetchDomains();
});
</script>
