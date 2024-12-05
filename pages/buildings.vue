<template>
  <div>
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Zoekhistorie</h2>
    </div>

    <div class="bg-white shadow rounded-lg p-4">
      <div class="space-y-4">
        <ClientOnly>
          <div>
            <template v-if="searchHistory.getSorted().length > 0">
              <NuxtLink 
                v-for="item in searchHistory.getSorted()" 
                :key="item.id" 
                :to="`/buildings/${item.id}`"
                class="block border rounded-lg p-4 hover:bg-gray-50 cursor-pointer mb-2"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-medium">{{ item.address }}</h4>
                    <p class="text-sm text-gray-500">Laatst gezocht: {{ new Date(item.lastSearched).toLocaleString() }}</p>
                    <div class="mt-2 text-sm text-gray-600">
                      <p>Bouwjaar: {{ item.results[0]?.bouwjaar || 'Onbekend' }}</p>
                      <p>Gebruiksdoel: {{ item.results[0]?.gebruiksdoel || 'Onbekend' }}</p>
                      <p>Oppervlakte: {{ item.results[0]?.oppervlakte ? `${item.results[0].oppervlakte} m²` : 'Onbekend' }}</p>
                      <p>Gerelateerde adressen: {{ item.results[0]?.relatedAddresses?.length || 0 }}</p>
                    </div>
                  </div>
                  <div class="text-sm text-blue-600">Details bekijken →</div>
                </div>
              </NuxtLink>

              <div class="flex justify-end pt-4 border-t">
                <button 
                  @click="searchHistory.clear()"
                  class="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-600 rounded hover:bg-red-50"
                >
                  Geschiedenis wissen
                </button>
              </div>
            </template>

            <div v-else class="text-gray-500 text-center py-8">
              <p class="mb-2">Geen zoekgeschiedenis beschikbaar</p>
              <p class="text-sm">Zoek een adres om het hier te zien verschijnen</p>
            </div>
          </div>
        </ClientOnly>
      </div>
    </div>

    <!-- Debug Information -->
    <div class="mt-8 p-4 bg-gray-100 rounded-lg">
      <h3 class="font-medium mb-2">Debug Information</h3>
      <div class="space-y-2 text-sm font-mono whitespace-pre-wrap">
        <p>Raw Search History: {{ JSON.stringify(searchHistory.items.value, null, 2) }}</p>
        <p>Sorted History: {{ JSON.stringify(searchHistory.getSorted(), null, 2) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Zoekhistorie',
  layout: 'default'
})

useHead({
  title: 'Zoekhistorie - BAG Code Extractor'
})

const { searchHistory } = useBagApi()

onMounted(() => {
  console.log('Buildings page mounted')
  if (process.client) {
    const stored = localStorage.getItem('bagSearchHistory')
    console.log('Initial stored history:', stored)
  }
})
</script> 