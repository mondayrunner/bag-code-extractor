<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">
        Vabi XML Maker (BETA)
      </h2>
    </div>

    <!-- Debug Panel -->
    <div
      v-if="debugMessages.length > 0"
      class="mb-8 bg-gray-50 rounded-lg p-4 border border-gray-200"
    >
      <h3 class="text-lg font-medium text-gray-900 mb-2">Verwerkingsstatus</h3>
      <div
        ref="debugMessagesContainer"
        class="space-y-1 max-h-40 overflow-y-auto"
      >
        <div
          v-for="(message, index) in debugMessages"
          :key="index"
          class="text-sm"
        >
          <span class="text-gray-500">{{ message.timestamp }}: </span>
          <span
            :class="{
              'text-green-600': message.type === 'success',
              'text-red-600': message.type === 'error',
              'text-blue-600': message.type === 'info',
              'text-orange-600': message.type === 'warning',
            }"
          >
            {{ message.text }}
          </span>
        </div>
      </div>
    </div>

    <!-- Reset Notification -->
    <div
      v-if="showResetNotification"
      class="mb-4 bg-blue-50 text-blue-700 p-4 rounded-md flex items-center justify-between"
    >
      <div class="flex items-center">
        <span class="font-medium">Selecties zijn gereset</span>
      </div>
      <button
        @click="showResetNotification = false"
        class="text-blue-500 hover:text-blue-600"
      >
        <span class="sr-only">Sluiten</span>
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>

    <!-- Upload Type Selection -->
    <div class="mb-8">
      <div class="flex space-x-4">
        <button
          @click="activeTab = 'excel'"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-md',
            activeTab === 'excel'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          STAP 1: Upload Excel
        </button>
        <button
          @click="activeTab = 'xml'"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-md',
            activeTab === 'xml'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          STAP 2: Upload XML en genereer nieuwe XML
        </button>
      </div>

      <!-- XML Upload Section (Moved here) -->
      <div v-if="activeTab === 'xml'" class="mt-4">
        <div class="flex items-center justify-between mb-4">
          <div v-if="!xmlContent" class="flex-grow">
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
                accept=".xml"
                @change="handleFileSelect"
                ref="xmlFileInput"
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
                  Sleep je XML bestand hierheen of klik om te bladeren
                </div>
                <div class="text-sm text-gray-500">
                  Ondersteund formaat: .xml
                </div>
              </div>
            </label>
          </div>
          <div v-else class="flex-grow flex justify-end">
            <button
              @click="reloadXml"
              class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Herlaad XML
            </button>
          </div>
        </div>

        <!-- Status Notification -->
        <div
          v-if="xmlContent"
          class="mt-4 bg-blue-50 text-blue-700 p-4 rounded-md"
        >
          <div class="flex items-center">
            <svg
              class="h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="font-medium">
              {{
                xmlContent && !generatedXmlFiles.length
                  ? "XML template geladen en klaar voor gebruik"
                  : "XML bestand gegenereerd en gedownload"
              }}
            </span>
          </div>
        </div>

        <!-- Knoppen -->
        <div v-if="xmlContent" class="flex space-x-4 mt-4">
          <button
            @click="generateXmlFiles"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
            :disabled="isGeneratingXml"
          >
            <svg
              v-if="isGeneratingXml"
              class="animate-spin h-4 w-4 text-white"
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
            {{
              isGeneratingXml
                ? "XML bestand genereren..."
                : "Genereer en download XML bestand"
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- File Upload Section -->
    <div v-if="activeTab === 'excel'" class="mb-8">
      <div v-if="!excelData || Object.keys(excelData).length === 0">
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
            ref="excelFileInput"
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
              Sleep je Excel bestand hierheen of klik om te bladeren
            </div>
            <div class="text-sm text-gray-500">
              Ondersteunde formaten: .xlsx, .xls
            </div>
          </div>
        </label>
      </div>
      <div v-else class="flex justify-end">
        <button
          @click="reloadExcel"
          class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Herlaad Excel
        </button>
      </div>
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
      <span
        >{{ activeTab === "excel" ? "Excel" : "XML" }} bestand
        verwerken...</span
      >
    </div>

    <!-- Excel Results Section -->
    <div v-if="activeTab === 'excel' && excelData" class="space-y-6">
      <div
        v-for="(items, geoType) in excelData"
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
                <!-- <th
                  class="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Referentie woning (parent)
                </th>
                <th
                  class="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Representatieve (child)
                </th> -->
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Postcode
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Huisnummer
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
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Referentie Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="(item, index) in items"
                :key="index"
                :class="{
                  'bg-yellow-50':
                    item.referentie === 'R' ||
                    mainHouseKey === `${item.postcode}-${item.nr}`,
                  'bg-orange-50': item.referentie === 'U',
                  'bg-slate-50':
                    item.referentie === 'G' ||
                    referenceHouses.has(`${item.postcode}-${item.nr}`),
                }"
              >
                <!-- <td
                  class="w-20 px-3 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  <input
                    type="radio"
                    name="mainHouse"
                    class="h-4 w-4 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
                    @change="selectMainHouse(item.postcode, item.nr)"
                    :checked="mainHouseKey === `${item.postcode}-${item.nr}`"
                  />
                </td>
                <td
                  class="w-20 px-3 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4 text-slate-600 rounded border-gray-300 focus:ring-slate-500"
                    @change="toggleReferenceHouse(item.postcode, item.nr)"
                    :disabled="
                      !mainHouseKey ||
                      mainHouseKey === `${item.postcode}-${item.nr}`
                    "
                    :checked="
                      referenceHouses.has(`${item.postcode}-${item.nr}`)
                    "
                  />
                </td> -->
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
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    :class="{
                      'text-yellow-700 bg-yellow-100 px-2 py-1 rounded':
                        item.referentie === 'R',
                      'text-orange-700 bg-orange-100 px-2 py-1 rounded':
                        item.referentie === 'U',
                      'text-slate-700 bg-slate-100 px-2 py-1 rounded':
                        item.referentie === 'G',
                    }"
                  >
                    {{
                      item.referentie === "R"
                        ? "Referentie (parent)"
                        : item.referentie === "U"
                        ? "Uniek"
                        : item.referentie === "G"
                        ? "Representatieve (child)"
                        : ""
                    }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Geselecteerde hiërarchie -->
    <div
      v-if="Object.keys(excelData).length > 0"
      class="mb-8 bg-white shadow rounded-lg p-4 mt-20"
    >
      <div>
        <h3 class="text-lg font-medium text-gray-900">
          Geselecteerde Woningen
        </h3>
        <div class="mt-2 space-y-6">
          <div v-for="(items, type) in excelData" :key="type">
            <template
              v-for="item in items"
              :key="`${item.postcode}-${item.nr}`"
            >
              <div v-if="item.referentie === 'R'" class="mb-4">
                <div
                  class="font-semibold text-yellow-700 bg-yellow-50 px-3 py-2 rounded-md"
                >
                  Referentie woning (parent): {{ item.postcode }}-{{
                    item.nr
                  }}
                  ({{ item.Type }})
                </div>
                <div class="mt-2 ml-4 space-y-2">
                  <div
                    v-for="child in items.filter(
                      (h) =>
                        h.referentie === 'G' &&
                        h.Type === item.Type &&
                        `${h.postcode}-${h.nr}` !==
                          `${item.postcode}-${item.nr}`
                    )"
                    :key="`${child.postcode}-${child.nr}`"
                    class="text-slate-700 bg-slate-50 px-3 py-2 rounded-md"
                  >
                    Representatieve woning (child): {{ child.postcode }}-{{
                      child.nr
                    }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { read, utils } from "xlsx";
import { DOMParser, XMLSerializer } from "xmldom";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { useXmlValidator } from "~/composables/useXmlValidator";

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
  aantal_type?: number;
  code?: string;
  referentie?: string;
  Referentie?: string;
}

const activeTab = ref("excel");
const isDragging = ref(false);
const isLoading = ref(false);
const isGeneratingXml = ref(false);
const excelData = ref<Record<string, ExcelRow[]>>({});
const xmlContent = ref<string>("");
const excelFileInput = ref<HTMLInputElement | null>(null);
const xmlFileInput = ref<HTMLInputElement | null>(null);
const mainHouseKey = ref<string | null>(null);
const referenceHouses = ref(new Set<string>());
const generatedXmlFiles = ref<{ filename: string; content: string }[]>([]);
const excelFileName = ref<string>("");

interface DebugMessage {
  text: string;
  timestamp: string;
  type: "info" | "error" | "success" | "warning";
}

const debugMessages = ref<DebugMessage[]>([]);
const showResetNotification = ref(false);
const debugMessagesContainer = ref<HTMLElement | null>(null);

// Add watch for debug messages
watch(
  debugMessages,
  (newMessages) => {
    if (newMessages.length > 0) {
      nextTick(() => {
        if (debugMessagesContainer.value) {
          const container = debugMessagesContainer.value;
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  },
  { deep: true }
);

const addDebugMessage = (
  text: string,
  type: "info" | "error" | "success" | "warning" = "info"
) => {
  const timestamp = new Date().toLocaleTimeString();
  debugMessages.value.push({ text, timestamp, type });
  console.log(`${type.toUpperCase()}: ${text}`);
};

const clearDebugMessages = () => {
  debugMessages.value = [];
};

const selectMainHouse = (postcode: string, nr: string | number) => {
  const key = `${postcode}-${nr}`;
  if (mainHouseKey.value === key) {
    mainHouseKey.value = null;
    referenceHouses.value.clear();
  } else {
    mainHouseKey.value = key;
    referenceHouses.value.delete(key);
  }
};

const toggleReferenceHouse = (postcode: string, nr: string | number) => {
  const key = `${postcode}-${nr}`;
  if (referenceHouses.value.has(key)) {
    referenceHouses.value.delete(key);
  } else if (mainHouseKey.value && key !== mainHouseKey.value) {
    referenceHouses.value.add(key);
  }
};

const resetSelections = () => {
  mainHouseKey.value = null;
  referenceHouses.value.clear();
  addDebugMessage("Selecties zijn gereset", "info");
  showResetNotification.value = true;
};

watch(activeTab, () => {
  showResetNotification.value = false;
  generatedXmlFiles.value = []; // Reset generated XML files when switching tabs
});

const processExcelFile = async (file: File) => {
  isLoading.value = true;
  debugMessages.value = [];
  addDebugMessage(`Excel bestand verwerken: ${file.name}`, "info");

  try {
    // Store Excel filename without extension
    excelFileName.value = file.name.replace(/\.(xlsx|xls)$/i, "");

    mainHouseKey.value = null;
    referenceHouses.value.clear();
    addDebugMessage("Selecties zijn gereset", "info");

    const buffer = await file.arrayBuffer();
    const workbook = read(buffer);

    const worksheet = workbook.Sheets["INVOER"];
    if (!worksheet) {
      throw new Error(
        "Kan het 'INVOER' tabblad niet vinden in het Excel bestand"
      );
    }

    const data = utils.sheet_to_json<ExcelRow>(worksheet, {
      range: 3,
      raw: true,
      defval: "",
    });

    // Debug log to check the raw data
    console.log("Raw Excel data:", data);

    // First find the reference house (R)
    const referenceHouse = data.find((row) => {
      const ref = row.referentie || row.Referentie; // Check both lowercase and uppercase
      return ref?.toString().trim().toUpperCase() === "R";
    });

    // If we found a reference house, set it as main house and find its children
    if (referenceHouse && referenceHouse.postcode && referenceHouse.nr) {
      mainHouseKey.value = `${referenceHouse.postcode}-${referenceHouse.nr}`;
      addDebugMessage(
        `Referentie woning gevonden: ${mainHouseKey.value}`,
        "success"
      );

      // Find all houses marked as 'G' of the same type as the reference house
      const childHouses = data.filter((row) => {
        const ref = row.referentie || row.Referentie; // Check both lowercase and uppercase
        return (
          row.Type === referenceHouse.Type && // Same type as reference house
          ref?.toString().trim().toUpperCase() === "G" && // Is marked as child
          row.postcode &&
          row.nr && // Has required fields
          `${row.postcode}-${row.nr}` !== mainHouseKey.value
        ); // Not the reference house itself
      });

      // Clear and add all marked child houses
      referenceHouses.value.clear();
      childHouses.forEach((house) => {
        const key = `${house.postcode}-${house.nr}`;
        referenceHouses.value.add(key);
      });

      if (childHouses.length > 0) {
        addDebugMessage(
          `${childHouses.length} representatieve woningen (G) van type "${referenceHouse.Type}" gevonden`,
          "success"
        );
      }
    }

    excelData.value = data.reduce((acc, curr) => {
      if (!curr.postcode || !curr.nr) return acc;

      const type = curr.Type || "Unknown";
      if (!acc[type]) {
        acc[type] = [];
      }

      // Debug log for each row's referentie value
      console.log(
        `Processing row - Postcode: ${curr.postcode}, Nr: ${
          curr.nr
        }, Referentie: ${curr.referentie || curr.Referentie}`
      );

      // Ensure referentie is properly captured and normalized
      let referentie = curr.referentie || curr.Referentie;
      if (referentie) {
        // Normalize the value to uppercase and trim
        referentie = referentie.toString().trim().toUpperCase();
        // Only accept valid values
        if (!["R", "U", "G"].includes(referentie)) {
          console.warn(
            `Invalid referentie value found: ${referentie} for ${curr.postcode}-${curr.nr}`
          );
          referentie = undefined;
        }
      }

      acc[type].push({
        adres: curr.adres || "",
        postcode: curr.postcode,
        nr: curr.nr,
        "GEO-type": curr["GEO-type"] || "",
        Type: type,
        plaats: curr.plaats || "Breda",
        referentie: referentie,
      });

      return acc;
    }, {} as Record<string, ExcelRow[]>);

    // Debug log to check processed data
    console.log("Processed Excel data:", excelData.value);

    addDebugMessage("Excel bestand succesvol verwerkt", "success");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Onbekende fout";
    addDebugMessage(`Fout bij verwerken Excel: ${errorMessage}`, "error");
    console.error("Gedetailleerde fout:", error);
    alert(`Fout bij verwerken Excel bestand: ${errorMessage}`);
  } finally {
    isLoading.value = false;
  }
};

const processXMLFile = async (file: File) => {
  isLoading.value = true;
  debugMessages.value = [];
  generatedXmlFiles.value = []; // Reset generated files when uploading new XML
  addDebugMessage(`XML bestand verwerken: ${file.name}`, "info");

  try {
    const text = await file.text();
    if (!text || text.length === 0) {
      throw new Error("XML bestand is leeg");
    }

    // Validate XML using our new validator
    const { validateXml } = useXmlValidator();
    const validationResult = validateXml(text);

    // Add warnings to debug messages
    validationResult.warnings.forEach((warning) => {
      addDebugMessage(warning, "warning");
    });

    if (!validationResult.isValid) {
      const errorMessages = validationResult.errors.join("\n");
      throw new Error(`XML validatie fouten:\n${errorMessages}`);
    }

    xmlContent.value = text;
    addDebugMessage("XML template succesvol gevalideerd en geladen", "success");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Onbekende fout";
    addDebugMessage(`Fout bij verwerken XML: ${errorMessage}`, "error");
    console.error("Gedetailleerde fout:", error);
    alert(`Fout bij verwerken XML bestand: ${errorMessage}`);
  } finally {
    isLoading.value = false;
  }
};

const generateUuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const formatXml = (xml: string): string => {
  // First clean up any existing formatting
  xml = xml
    .replace(/>\s*</g, "><") // Remove whitespace between tags
    .replace(/\s*\/>/g, "/>") // Clean self-closing tags
    .replace(/>\s*$/g, ">"); // Remove trailing whitespace

  let formatted = "";
  let depth = 0;
  const tab = "\t";

  // Split into individual tags
  const tags = xml.match(/<[^>]+>/g) || [];

  tags.forEach((tag, index) => {
    const isClosingTag = tag.match(/^<\//);
    const isSelfClosingTag = tag.match(/\/>/);
    const isOpeningTag = !isClosingTag && !isSelfClosingTag;
    const isProjectTag = tag.includes('Project Index="-1"');

    // Decrease indent for closing tags
    if (isClosingTag) {
      depth--;
    }

    // Add the tag with proper indentation
    if (index === 0) {
      // Root tag (Project)
      formatted += tag + "\n\n";
    } else {
      // Add indentation
      formatted += tab.repeat(depth) + tag;

      // Add newline unless it's the last tag
      if (index < tags.length - 1) {
        formatted += "\n";
      }
    }

    // Increase indent for opening tags
    if (isOpeningTag) {
      depth++;
    }
  });

  return formatted;
};

const generateXmlFiles = () => {
  if (!xmlContent.value || !excelData.value) {
    addDebugMessage("Geen XML-template of Excel data beschikbaar", "error");
    return;
  }

  isGeneratingXml.value = true;
  addDebugMessage("XML bestand genereren...", "info");
  generatedXmlFiles.value = [];

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent.value, "text/xml");

    // Get all houses from Excel data
    const allHouses = Object.values(excelData.value).flat();

    // Find all reference houses (R)
    const referenceHouses = allHouses.filter(
      (house) => house.referentie?.toString().trim().toUpperCase() === "R"
    );

    // Process each reference house
    referenceHouses.forEach((refHouse) => {
      addDebugMessage(
        `Verwerken referentie woning: ${refHouse.postcode}-${refHouse.nr}`,
        "info"
      );

      // Find the corresponding address in XML
      const adresNodes = Array.from(
        xmlDoc.getElementsByTagName("Adresgegevens")
      );

      for (const adresNode of adresNodes) {
        const postcodeNode = adresNode.getElementsByTagName("Postcode")[0];
        const huisnummerNode = adresNode.getElementsByTagName("Huisnummer")[0];

        if (
          postcodeNode?.textContent === refHouse.postcode &&
          huisnummerNode?.textContent === refHouse.nr.toString()
        ) {
          // Get parent element and RegistratiegegevensInvoer
          const parentElement = adresNode.parentNode as Element;
          const registratieNode = parentElement.getElementsByTagName(
            "RegistratiegegevensInvoer"
          )[0];

          if (!registratieNode) {
            addDebugMessage(
              "RegistratiegegevensInvoer node niet gevonden!",
              "error"
            );
            continue;
          }

          // Find all G-houses of the same type
          const childHouses = allHouses.filter(
            (house) =>
              house.referentie?.toString().trim().toUpperCase() === "G" &&
              house.Type === refHouse.Type
          );

          if (childHouses.length > 0) {
            // 1. Set RepresentatieveWoningen to 1
            const repWoningenNode = registratieNode.getElementsByTagName(
              "RepresentatieveWoningen"
            )[0];
            if (repWoningenNode) {
              repWoningenNode.textContent = "1";
            }

            // 2 & 3. Remove existing list if present and create new one
            const existingList = registratieNode.getElementsByTagName(
              "ObjectRegistratieRepresentatiefLijstInvoer"
            )[0];
            if (existingList) {
              registratieNode.removeChild(existingList);
            }

            // Create new list with GUID
            const objRegList = xmlDoc.createElement(
              "ObjectRegistratieRepresentatiefLijstInvoer"
            );
            objRegList.setAttribute("Index", "-1");
            const guidList = xmlDoc.createElement("Guid");
            guidList.textContent = generateUuid();
            objRegList.appendChild(guidList);

            // 4. Add each child
            childHouses.forEach((child, index) => {
              const childNode = xmlDoc.createElement(
                "ObjectRegistratieRepresentatiefInvoer"
              );
              childNode.setAttribute("Index", (index + 1).toString());

              const elements = [
                { tag: "Guid", value: generateUuid() },
                { tag: "Huisnummer", value: child.nr.toString() },
                { tag: "HuisletterHuisnummertoevoeging", value: "" },
                { tag: "Detailaanduiding", value: "" },
                { tag: "Postcode", value: child.postcode },
                { tag: "BagPandId", value: "" },
                { tag: "BagStandplaatsId", value: "" },
                { tag: "BagLigplaatsId", value: "" },
                { tag: "BagObjectId", value: "" },
                { tag: "ProvisionalId", value: "" },
              ];

              elements.forEach(({ tag, value }) => {
                const elem = xmlDoc.createElement(tag);
                elem.textContent = value;
                childNode.appendChild(elem);
              });

              objRegList.appendChild(childNode);
            });

            // Add the complete list to the registration node
            registratieNode.appendChild(objRegList);
          }
          break;
        }
      }
    });

    // Serialize back to string and save
    const serializer = new XMLSerializer();
    const xmlString = serializer.serializeToString(xmlDoc);

    generatedXmlFiles.value.push({
      filename: "complete_vabi.xml",
      content: xmlString,
    });

    addDebugMessage("XML bestand succesvol gegenereerd", "success");
    downloadXmlFiles();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Onbekende fout";
    addDebugMessage(`Fout bij genereren XML: ${errorMessage}`, "error");
    console.error("Fout bij genereren XML:", error);
  } finally {
    isGeneratingXml.value = false;
  }
};

const downloadXmlFiles = () => {
  generatedXmlFiles.value.forEach((file) => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const datePrefix = `${year}${month}${day}`;

    const filename = excelFileName.value
      ? `${datePrefix}_${excelFileName.value}.xml`
      : `${datePrefix}_complete_vabi.xml`;

    const blob = new Blob([file.content], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  });
  addDebugMessage("XML bestanden gedownload", "success");
};

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    const file = input.files[0];
    clearDebugMessages(); // Clear previous messages
    addDebugMessage(`Bestand geselecteerd: ${file.name}`, "info");
    try {
      if (activeTab.value === "excel") {
        await processExcelFile(file);
      } else {
        await processXMLFile(file);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Onbekende fout";
      addDebugMessage(`Fout: ${errorMessage}`, "error");
      console.error("Fout bij verwerken bestand:", error);
      alert(`Fout bij verwerken bestand: ${errorMessage}`);
    }
  }
};

const handleFileDrop = async (event: DragEvent) => {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (files?.length) {
    const file = files[0];
    clearDebugMessages(); // Clear previous messages
    addDebugMessage(`Bestand geplaatst: ${file.name}`, "info");
    try {
      if (activeTab.value === "excel" && file.name.match(/\.(xlsx|xls)$/i)) {
        await processExcelFile(file);
      } else if (activeTab.value === "xml" && file.name.match(/\.xml$/i)) {
        await processXMLFile(file);
      } else {
        const message = `Ongeldig bestandstype. Upload een ${
          activeTab.value === "excel" ? "Excel" : "XML"
        } bestand`;
        addDebugMessage(message, "error");
        alert(message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Onbekende fout";
      addDebugMessage(`Fout: ${errorMessage}`, "error");
      console.error("Fout bij verwerken bestand:", error);
      alert(`Fout bij verwerken bestand: ${errorMessage}`);
    }
  }
};

const reloadExcel = () => {
  excelData.value = {};
  mainHouseKey.value = null;
  referenceHouses.value.clear();
  excelFileName.value = ""; // Clear filename
  if (excelFileInput.value) {
    excelFileInput.value.value = "";
  }
  clearDebugMessages();
  addDebugMessage("Excel herlaad modus geactiveerd", "info");
};

const reloadXml = () => {
  xmlContent.value = "";
  if (xmlFileInput.value) {
    xmlFileInput.value.value = "";
  }
  clearDebugMessages();
  addDebugMessage("XML herlaad modus geactiveerd", "info");
};
</script>
