<template>
  <MainLayout>
    <div class="p-6">
      <h1 class="text-xl font-semibold mb-4">Blokirani domeni</h1>

      <div class="overflow-x-auto rounded-lg shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">#</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Domen</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">IP</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Vreme</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-for="(entry, index) in blockedDomains" :key="entry._id">
              <td class="px-4 py-2 text-sm">{{ index + 1 }}</td>
              <td class="px-4 py-2 text-sm">{{ entry.name }}</td>
              <td class="px-4 py-2 text-sm">{{ entry.ip }}</td>
              <td class="px-4 py-2 text-sm">{{ formatTimestamp(entry.timestamp) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import MainLayout from "@/layouts/MainLayout.vue";

const blockedDomains = ref([]);
const apiUrl = import.meta.env.VITE_API_URL;

const formatTimestamp = (ts) => new Date(ts).toLocaleString("sr-RS");

onMounted(async () => {
  document.title = "Blokirani domeni";
  const token = localStorage.getItem("jwt");

  try {
    const res = await fetch(`${apiUrl}/api/domains/blocked`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Neuspešan odgovor sa servera.");
    const data = await res.json();
    blockedDomains.value = data.data;
  } catch (err) {
    console.error("Greška pri dohvatanju blokiranih domena:", err);
  }
});
</script>
