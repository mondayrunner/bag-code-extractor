<template>
  <div>
    <!-- Mobile dropdown -->
    <div class="grid grid-cols-1 sm:hidden mb-4">
      <select 
        v-model="currentTab"
        aria-label="Select a tab" 
        class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
      >
        <option v-for="tab in tabs" :key="tab.name" :value="tab.id">{{ tab.name }}</option>
      </select>
      <ChevronDownIcon class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500" aria-hidden="true" />
    </div>

    <!-- Desktop tabs -->
    <div class="hidden sm:block mb-4">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            :class="[
              currentTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Tab content -->
    <div v-if="currentTab === 'address'" class="mt-4">
      <form @submit.prevent="searchAddress">
        <div class="flex gap-2 items-end">
          <div>
            <label for="postcode" class="block text-sm font-medium text-gray-700">Postcode</label>
            <input 
              v-model="postcode" 
              type="text" 
              id="postcode" 
              class="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6 border border-gray-300 rounded-md" 
              placeholder="1234AB" 
            />
          </div>
          <div>
            <label for="huisnummer" class="block text-sm font-medium text-gray-700">Huisnummer</label>
            <input 
              v-model="huisnummer" 
              type="text" 
              id="huisnummer" 
              class="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6 border border-gray-300 rounded-md" 
              placeholder="1" 
            />
          </div>
          <button 
            type="submit" 
            class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Zoeken
          </button>
        </div>
      </form>
    </div>

    <div v-else-if="currentTab === 'pandId'" class="mt-4">
      <form @submit.prevent="searchPandId">
        <div class="flex gap-2 items-end">
          <div>
            <label for="pandId" class="block text-sm font-medium text-gray-700">Pand ID</label>
            <input 
              v-model="pandId" 
              type="text" 
              id="pandId" 
              class="block min-w-0 w-64 py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6 border border-gray-300 rounded-md" 
              placeholder="0503100000036329" 
            />
          </div>
          <button 
            type="submit" 
            class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Zoeken
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/16/solid'

const tabs = [
  { id: 'address', name: 'Zoeken op adres' },
  { id: 'pandId', name: 'Zoeken op Pand ID' }
]

const currentTab = ref('address')
const postcode = ref('')
const huisnummer = ref('')
const pandId = ref('')

const emit = defineEmits(['search'])

const searchAddress = () => {
  emit('search', { postcode: postcode.value, huisnummer: huisnummer.value })
}

const searchPandId = () => {
  emit('search', { pandId: pandId.value })
}
</script> 