<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-semibold mb-6">Excel Upload</h1>

    <!-- File Upload Section -->
    <div class="mb-8">
      <label
        class="block w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-gray-400"
        :class="{ 'bg-gray-50': isDragging }"
        @dragenter.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @dragover.prevent
        @drop.prevent="handleFileDrop"
      >
        <input
          type="file"
          class="hidden"
          accept=".xlsx,.xls"
          @change="handleFileSelect"
          ref="fileInput"
        />
        <div class="space-y-2">
          <div class="flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div class="text-gray-600">
            Drop your Excel file here or click to browse
          </div>
          <div class="text-sm text-gray-500">
            Supported formats: .xlsx, .xls
          </div>
        </div>
      </label>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center space-x-2">
      <svg
        class="animate-spin h-5 w-5 text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span>Processing Excel file...</span>
    </div>

    <!-- Results Section -->
    <div v-if="groupedData" class="space-y-6">
      <div
        v-for="(items, geoType) in groupedData"
        :key="geoType"
        class="bg-white shadow rounded-lg overflow-hidden"
      >
        <div class="bg-gray-50 px-4 py-3 border-b">
          <h3 class="text-lg font-medium text-gray-900">{{ geoType }}</h3>
          <p class="text-sm text-gray-500">{{ items.length }} items</p>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referentiewoning
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Postal Code
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  House Number
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  GEO-type
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(item, index) in items" 
                  :key="index" 
                  :class="{ 'bg-yellow-50': checkedRows.has(`${item.postcode}-${item.nr}`) }">
                <td class="w-20 px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  <input 
                    type="checkbox" 
                    class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    @change="toggleRow(item.postcode, item.nr)"
                    :checked="checkedRows.has(`${item.postcode}-${item.nr}`)"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.postcode }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ item.nr }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ item["GEO-type"] }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ item.Type }}
                  </td>
                </tr>
              </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { read, utils } from "xlsx";

definePageMeta({
  layout: "default",
});

interface ExcelRow {
  adres: string;
  nr: string | number;
  "GEO-type": string;
  Type: string;
  postcode: string;
  plaats: string;
  aantal_type: number;
  code: string;
}

const isDragging = ref(false);
const isLoading = ref(false);
const groupedData = ref<Record<string, ExcelRow[]>>({});
const fileInput = ref<HTMLInputElement | null>(null);
const checkedRows = ref(new Set<string>());

const toggleRow = (postcode: string, nr: string) => {
  const key = `${postcode}-${nr}`;
  if (checkedRows.value.has(key)) {
    checkedRows.value.delete(key);
  } else {
    checkedRows.value.add(key);
  }
};

const processExcelFile = async (file: File) => {
  isLoading.value = true;
  try {
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer);

    const worksheet = workbook.Sheets["INVOER"];
    if (!worksheet) {
      throw new Error("Could not find 'INVOER' tab in the Excel file");
    }

    const data = utils.sheet_to_json(worksheet, {
      range: 3,
      raw: true,
      defval: "",
    });

    console.log("First row of data:", data[0]);

    groupedData.value = data.reduce((acc, curr) => {
      if (!curr.postcode || !curr.nr) return acc;

      const type = curr.Type || "Unknown";

      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push({
        postcode: curr.postcode,
        nr: curr.nr,
        "GEO-type": curr["GEO-type"] || "",
        Type: type,
      });
      return acc;
    }, {} as Record<string, ExcelRow[]>);
  } catch (error) {
    console.error("Detailed error:", error);
    alert(
      `Error processing Excel file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  } finally {
    isLoading.value = false;
  }
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    processExcelFile(input.files[0]);
  }
};

const handleFileDrop = (event: DragEvent) => {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (files?.length) {
    processExcelFile(files[0]);
  }
};
</script>
