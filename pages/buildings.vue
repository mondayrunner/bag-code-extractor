<template>
  <div>
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900">Zoekhistorie</h2>
    </div>

    <div v-if="sortedHistory.length === 0" class="text-center py-12">
      <p class="text-gray-500">Nog geen zoekgeschiedenis beschikbaar</p>
    </div>

    <div v-else class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table class="min-w-full divide-y divide-gray-300">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Adres</th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Laatst gezocht</th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">BAG ID</th>
            <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span class="sr-only">Excel</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="item in sortedHistory" :key="item.id">
            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              {{ item.address }}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
              {{ new Date(item.lastSearched).toLocaleString() }}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
              {{ item.id }}
            </td>
            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
              <button 
                @click="downloadExcel(item.results)"
                class="text-indigo-600 hover:text-indigo-900"
              >
                Excel downloaden
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { utils, writeFile } from 'xlsx'
import type { SearchResult } from '~/types/bag'

const { searchHistory } = useBagApi()
const sortedHistory = computed(() => searchHistory.getSorted())

const downloadExcel = (results: SearchResult[]) => {
  // Get all unique addresses including related ones
  const allAddresses = results.reduce((acc: SearchResult[], result) => {
    // Add the main result
    acc.push(result)
    // Add related addresses if they exist
    if (Array.isArray(result.relatedAddresses)) {
      acc.push(...result.relatedAddresses)
    }
    return acc
  }, [])

  // Remove duplicates based on identificatie
  const uniqueAddresses = allAddresses.filter((address, index, self) =>
    index === self.findIndex((a) => a.identificatie === address.identificatie)
  )

  // Transform data for Excel
  const excelData = uniqueAddresses.map(result => ({
    'Straat': result.straat || '',
    'Huisnummer': result.huisnummer || '',
    'Huisletter': result.huisletter || '',
    'Toevoeging': result.huisnummertoevoeging || '',
    'Postcode': result.postcode || '',
    'Plaats': result.woonplaats || '',
    'Status': result.status || 'Onbekend',
    'Gebruiksdoel': Array.isArray(result.gebruiksdoel) ? result.gebruiksdoel.join(', ') : (result.gebruiksdoel || 'Onbekend'),
    'Oppervlakte': result.oppervlakte ? `${result.oppervlakte}` : 'Onbekend',
    'Bouwjaar': result.bouwjaar || 'Onbekend',
    'BAG ID': result.bagNummeraanduidingId || result.identificatie || '',
    'Documentdatum': result.documentdatum || '',
    'Documentnummer': result.documentnummer || '',
    'Voorkomenidentificatie': result.voorkomenidentificatie || '',
    'X-coördinaat': result.geometry?.coordinates?.[0] || '',
    'Y-coördinaat': result.geometry?.coordinates?.[1] || '',
    'Gerelateerd adres': result.nevenadres ? 'Ja' : 'Nee'
  }))

  // Create workbook and worksheet
  const wb = utils.book_new()
  const ws = utils.json_to_sheet(excelData)

  // Set column widths
  const colWidths = [
    { wch: 20 }, // Straat
    { wch: 10 }, // Huisnummer
    { wch: 5 },  // Huisletter
    { wch: 10 }, // Toevoeging
    { wch: 8 },  // Postcode
    { wch: 15 }, // Plaats
    { wch: 15 }, // Status
    { wch: 30 }, // Gebruiksdoel
    { wch: 12 }, // Oppervlakte
    { wch: 10 }, // Bouwjaar
    { wch: 20 }, // BAG ID
    { wch: 12 }, // Documentdatum
    { wch: 15 }, // Documentnummer
    { wch: 10 }, // Voorkomenidentificatie
    { wch: 12 }, // X-coördinaat
    { wch: 12 }, // Y-coördinaat
    { wch: 10 }  // Gerelateerd adres
  ]
  ws['!cols'] = colWidths

  // Add worksheet to workbook
  utils.book_append_sheet(wb, ws, 'BAG Gegevens')

  // Generate filename with address
  const address = results[0].straat + results[0].huisnummer
  const filename = `BAG_${address.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`

  // Download file
  writeFile(wb, filename)
}

useHead({
  title: 'Zoekhistorie - BAG Code Extractor'
})

definePageMeta({
  layout: 'default'
})
</script> 