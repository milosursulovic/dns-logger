<template>
  <MainLayout>
    <div class="p-6">
      <h1 class="text-xl font-semibold mb-4">Blokirani domeni</h1>

      <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
        <input v-model="searchQuery" @input="handleSearch" type="text" placeholder="Pretraži po domenu, IP adresi..."
          class="w-full sm:w-auto flex-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                Domen
                <span v-if="sortBy === 'name'">
                  {{ sortOrder === "asc" ? "↑" : "↓" }}
                </span>
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
            <tr v-for="(entry, index) in blockedDomains" :key="entry._id">
              <td class="px-4 py-2 text-sm text-gray-700">
                {{ (page - 1) * limit + index + 1 }}
              </td>
              <td class="px-4 py-2 text-sm">{{ entry.name }}</td>
              <td class="px-4 py-2 text-sm">{{ entry.ip }}</td>
              <td class="px-4 py-2 text-sm">
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
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import MainLayout from "@/layouts/MainLayout.vue";
import { fetchWithAuth } from "@/utils/authFetch";

const apiUrl = import.meta.env.VITE_API_URL;
const blockedDomains = ref([]);
const total = ref(0);
const route = useRoute();
const router = useRouter();
const page = ref(parseInt(route.query.page) || 1);
const sortBy = ref(route.query.sortBy || "timestamp");
const sortOrder = ref(route.query.sortOrder || "desc");
const limit = 20;
const searchQuery = ref(route.query.search || "");
const totalPages = computed(() => Math.ceil(total.value / limit));
const formatTimestamp = (ts) => new Date(ts).toLocaleString("sr-RS");

watch(
  [page, sortBy, sortOrder, searchQuery],
  ([newPage, newSortBy, newSortOrder, newSearch]) => {
    router.replace({
      query: {
        page: newPage,
        sortBy: newSortBy || undefined,
        sortOrder: newSortOrder || undefined,
        search: newSearch || undefined,
      },
    });
  }
);

function handleSearch() {
  page.value = 1;
  fetchBlockedDomains();
}

async function fetchBlockedDomains() {
  try {
    const res = await fetchWithAuth(
      `/api/domains/blocked?page=${page.value}&limit=${limit}&sortBy=${sortBy.value}&sortOrder=${sortOrder.value}&search=${encodeURIComponent(searchQuery.value)}`
    );

    if (!res.ok) throw new Error("Neuspešan odgovor sa servera.");
    const data = await res.json();
    blockedDomains.value = data.data;
    total.value = data.total;
  } catch (err) {
    console.error("Greška pri dohvatanju blokiranih domena:", err);
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++;
    fetchBlockedDomains();
  }
}

function prevPage() {
  if (page.value > 1) {
    page.value--;
    fetchBlockedDomains();
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
  fetchBlockedDomains();
}

onMounted(() => {
  document.title = "Blokirani domeni";
  fetchBlockedDomains();
});
</script>
