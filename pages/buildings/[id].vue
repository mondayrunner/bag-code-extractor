<template>
  <div>
    <div class="mb-8 flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Details</h2>
      <NuxtLink 
        to="/buildings"
        class="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
      >
        Terug naar overzicht
      </NuxtLink>
    </div>

    <div v-if="historyItem" class="bg-white shadow rounded-lg p-6">
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-900">{{ historyItem.address }}</h3>
        <p class="text-sm text-gray-500">Laatst gezocht: {{ new Date(historyItem.lastSearched).toLocaleString() }}</p>
      </div>

      <AddressDetails 
        :results="historyItem.results"
      />
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500">Geen details gevonden voor dit adres</p>
      <NuxtLink 
        to="/buildings"
        class="mt-4 inline-block text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
      >
        Terug naar overzicht
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { searchHistory } = useBagApi()
const historyItem = ref(null)

onMounted(() => {
  if (process.client) {
    const id = route.params.id
    console.log('Looking for history item with id:', id)
    
    // Get all history items and find the one with matching id
    const sorted = searchHistory.getSorted()
    console.log('All history items:', sorted)
    
    historyItem.value = sorted.find(item => item.id === id)
    console.log('Found history item:', historyItem.value)
  }
})

// Set page title
useHead({
  title: historyItem.value ? `${historyItem.value.address} - BAG Code Extractor` : 'Details - BAG Code Extractor'
})
</script> 