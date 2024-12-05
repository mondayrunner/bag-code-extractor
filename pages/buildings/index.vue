<template>
  <div class="text-center py-12">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Zoekhistorie</h2>
    <p class="text-gray-500">Deze functionaliteit is momenteel in ontwikkeling</p>
    <NuxtLink 
      to="/"
      class="mt-4 inline-block text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
    >
      Terug naar zoeken
    </NuxtLink>
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
</script> 