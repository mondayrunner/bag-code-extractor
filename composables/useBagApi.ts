import type { SearchResult } from '~/types/bag'

interface HistoryItem {
  id: string
  address: string
  lastSearched: number
  results: SearchResult[]
}

interface BagResponse {
  _embedded?: {
    adressen?: Array<{
      identificatie: string
      postcode: string
      huisnummer: string
      huisletter?: string
      huisnummertoevoeging?: string
      korteNaam: string
      woonplaatsNaam: string
      status?: { omschrijving: string }
      gebruiksdoel?: string[]
      oppervlakte?: number
      bouwjaar?: string
      nummeraanduidingIdentificatie: string
      geometry?: { coordinates: [number, number] }
      documentdatum?: string
      documentnummer?: string
      voorkomenidentificatie?: number
    }>
  }
}

export const useBagApi = () => {
  const config = useRuntimeConfig()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const results = ref<SearchResult[]>([])
  const debugInfo = ref<string>('')

  const getHistory = (): HistoryItem[] => {
    if (!process.client) return []
    try {
      const stored = localStorage.getItem('bagSearchHistory')
      console.log('Loading search history:', stored)
      if (!stored) return []
      
      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) {
        console.warn('Invalid history format, resetting')
        localStorage.removeItem('bagSearchHistory')
        return []
      }
      
      return parsed
    } catch (err) {
      console.error('Error loading history:', err)
      return []
    }
  }

  const addToHistory = (address: string, searchResults: SearchResult[]) => {
    if (!searchResults || searchResults.length === 0) return
    console.log('Adding to history:', { address, searchResults })

    try {
      const mainResult = searchResults[0]
      const historyItem: HistoryItem = {
        id: mainResult.bagNummeraanduidingId,
        address,
        lastSearched: Date.now(),
        results: searchResults
      }

      const history = getHistory()
      const existingIndex = history.findIndex(item => item.id === historyItem.id)
      
      if (existingIndex !== -1) {
        // Update existing item
        history[existingIndex] = historyItem
      } else {
        // Add new item
        history.unshift(historyItem)
        // Keep only the last 10 items
        if (history.length > 10) {
          history.pop()
        }
      }

      localStorage.setItem('bagSearchHistory', JSON.stringify(history))
      console.log('Updated history:', history)
    } catch (err) {
      console.error('Error adding to history:', err)
    }
  }

  const searchHistory = {
    getSorted: () => {
      const history = getHistory()
      console.log('Getting sorted history')
      return [...history].sort((a, b) => b.lastSearched - a.lastSearched)
    },
    clear: () => {
      if (process.client) {
        localStorage.removeItem('bagSearchHistory')
      }
    }
  }

  const fetchBagData = async (postcode: string, huisnummer: string) => {
    loading.value = true
    error.value = null
    results.value = []
    debugInfo.value = ''

    try {
      const formattedPostcode = postcode.replace(/\s+/g, '').toUpperCase()
      const endpoint = `/api/bag/adressenuitgebreid?postcode=${formattedPostcode}&huisnummer=${huisnummer}`
      
      console.log('Fetching BAG data from:', endpoint)
      const response = await $fetch<BagResponse>(endpoint)
      console.log('BAG API response:', response)

      if (response._embedded?.adressen) {
        results.value = response._embedded.adressen.map(adres => ({
          identificatie: adres.identificatie,
          postcode: adres.postcode,
          huisnummer: adres.huisnummer,
          huisletter: adres.huisletter,
          huisnummertoevoeging: adres.huisnummertoevoeging,
          straat: adres.korteNaam,
          woonplaats: adres.woonplaatsNaam,
          status: adres.status?.omschrijving || 'Onbekend',
          gebruiksdoel: adres.gebruiksdoel || [],
          oppervlakte: adres.oppervlakte,
          bouwjaar: adres.bouwjaar,
          bagNummeraanduidingId: adres.nummeraanduidingIdentificatie,
          geometry: adres.geometry,
          documentdatum: adres.documentdatum,
          documentnummer: adres.documentnummer,
          voorkomenidentificatie: adres.voorkomenidentificatie
        }))

        if (results.value.length > 0) {
          const address = `${results.value[0].straat} ${results.value[0].huisnummer}${results.value[0].huisletter || ''}${results.value[0].huisnummertoevoeging ? '-' + results.value[0].huisnummertoevoeging : ''}`
          addToHistory(address, results.value)
        }
      }

      debugInfo.value = JSON.stringify(response, null, 2)

    } catch (err: any) {
      console.error('Error fetching BAG data:', err)
      error.value = err.message || 'Er is een fout opgetreden bij het ophalen van de gegevens'
      debugInfo.value = JSON.stringify(err, null, 2)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    results,
    debugInfo,
    fetchBagData,
    searchHistory
  }
} 