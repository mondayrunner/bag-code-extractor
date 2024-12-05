<template>
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
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search'])
const postcode = ref('')
const huisnummer = ref('')

const searchAddress = () => {
  emit('search', { postcode: postcode.value, huisnummer: huisnummer.value })
}
</script> 