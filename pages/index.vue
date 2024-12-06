<template>
  <div>
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">BAG adres zoeken</h2>
      <AddressSearch @search="handleSearch" />
    </div>

    <div v-if="error" class="rounded-md bg-red-50 p-4 mb-4">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-gray-600">Loading...</div>

    <AddressDetails 
      v-if="results && results.length > 0" 
      :results="results"
      :debug-info="debugInfo"
      @update:results="updateResults"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AddressSearch from '~/components/AddressSearch.vue'
import AddressDetails from '~/components/AddressDetails.vue'

interface SearchParams {
  postcode?: string
  huisnummer?: string
  pandId?: string
}

const { results, loading, error, debugInfo, fetchBagData, fetchBagDataByPandId } = useBagApi()

const handleSearch = async (params: SearchParams) => {
  if (params.pandId) {
    await fetchBagDataByPandId(params.pandId)
  } else if (params.postcode && params.huisnummer) {
    await fetchBagData(params.postcode, params.huisnummer)
  }
}

const updateResults = (newResults: any[]) => {
  results.value = newResults
}

definePageMeta({
  title: 'BAG adres zoeken',
  layout: 'default'
})

useHead({
  title: 'BAG adres zoeken - BAG Code Extractor'
})
</script> 