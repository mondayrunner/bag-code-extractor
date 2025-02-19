<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Vabi XML Maker</h2>
    </div>

    <!-- Debug Panel -->
    <div
      v-if="debugMessages.length > 0"
      class="mb-8 bg-gray-50 rounded-lg p-4 border border-gray-200"
    >
      <h3 class="text-lg font-medium text-gray-900 mb-2">Verwerkingsstatus</h3>
      <div class="space-y-1 max-h-40 overflow-y-auto">
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
    </div>

    <!-- Geselecteerde hiërarchie -->
    <div v-if="mainHouseKey" class="mb-8 bg-white shadow rounded-lg p-4">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-medium text-gray-900">
            Geselecteerde Woningen
          </h3>
          <div class="mt-2">
            <p class="text-sm font-semibold">
              Hoofdwoning:
              <span class="text-blue-600">{{ mainHouseKey }}</span>
            </p>
            <p v-if="referenceHouses.size > 0" class="text-sm mt-2">
              Referentie-woningen:
            </p>
            <ul class="ml-4 list-disc text-sm text-gray-700">
              <li v-for="refKey in Array.from(referenceHouses)" :key="refKey">
                {{ refKey }}
              </li>
            </ul>
          </div>
        </div>
        <button
          @click="resetSelections"
          class="px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
        >
          Reset Selectie
        </button>
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

    <!-- XML Upload Section -->
    <div class="mb-8" v-if="activeTab === 'xml'">
      <div v-if="!xmlContent">
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
            <div class="text-sm text-gray-500">Ondersteund formaat: .xml</div>
          </div>
        </label>
      </div>
      <div v-else class="flex justify-end">
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
      <!-- Instruction Message -->
      <div
        v-if="Object.keys(excelData).length > 0"
        class="bg-indigo-50 p-4 rounded-md"
      >
        <p class="text-indigo-700">
          Selecteer een hoofdwoning (radio button) en eventueel
          referentiewoningen (checkboxes).
        </p>
      </div>

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
                <th
                  class="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Hoofdwoning
                </th>
                <th
                  class="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Referentie
                </th>
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
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="(item, index) in items"
                :key="index"
                :class="{
                  'bg-blue-50': mainHouseKey === `${item.postcode}-${item.nr}`,
                  'bg-yellow-50': referenceHouses.has(
                    `${item.postcode}-${item.nr}`
                  ),
                }"
              >
                <td
                  class="w-20 px-3 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  <input
                    type="radio"
                    name="mainHouse"
                    class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    @change="selectMainHouse(item.postcode, item.nr)"
                    :checked="mainHouseKey === `${item.postcode}-${item.nr}`"
                  />
                </td>
                <td
                  class="w-20 px-3 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
                    @change="toggleReferenceHouse(item.postcode, item.nr)"
                    :disabled="
                      !mainHouseKey ||
                      mainHouseKey === `${item.postcode}-${item.nr}`
                    "
                    :checked="
                      referenceHouses.has(`${item.postcode}-${item.nr}`)
                    "
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

    <!-- XML Results Section -->
    <div v-if="activeTab === 'xml' && xmlContent" class="space-y-6">
      <!-- Voor: XML Template -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="bg-gray-50 px-4 py-3 border-b">
          <h3 class="text-lg font-medium text-gray-900">
            XML Template geladen
          </h3>
          <p class="text-sm text-gray-500">Template is klaar voor gebruik</p>
        </div>
      </div>

      <!-- Knoppen -->
      <div class="flex space-x-4">
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
              ? "XML bestanden genereren..."
              : "Genereer XML bestanden"
          }}
        </button>
        <button
          v-if="generatedXmlFiles.length > 0"
          @click="downloadXmlFiles"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Download {{ generatedXmlFiles.length }} bestanden
        </button>
      </div>

      <!-- Na: Generated XML -->
      <div
        v-if="generatedXmlFiles.length > 0"
        class="bg-white shadow rounded-lg overflow-hidden"
      >
        <div class="bg-gray-50 px-4 py-3 border-b">
          <h3 class="text-lg font-medium text-gray-900">
            Gegenereerde XML bestanden
          </h3>
          <p class="text-sm text-gray-500">
            {{ generatedXmlFiles.length }} bestanden gegenereerd
          </p>
        </div>
        <div class="p-4">
          <ul class="space-y-2">
            <li
              v-for="(file, index) in generatedXmlFiles"
              :key="index"
              class="text-sm text-gray-700"
            >
              {{ file.filename }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { read, utils } from "xlsx";
import { DOMParser, XMLSerializer } from "xmldom";
import { XMarkIcon } from "@heroicons/vue/24/outline";

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

interface DebugMessage {
  text: string;
  timestamp: string;
  type: "info" | "error" | "success";
}

const debugMessages = ref<DebugMessage[]>([]);
const showResetNotification = ref(false);

const addDebugMessage = (
  text: string,
  type: "info" | "error" | "success" = "info"
) => {
  const timestamp = new Date().toLocaleTimeString();
  debugMessages.value.push({ text, timestamp, type });
  console.log(`${type.toUpperCase()}: ${text}`);
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
});

const processExcelFile = async (file: File) => {
  isLoading.value = true;
  debugMessages.value = [];
  addDebugMessage(`Excel bestand verwerken: ${file.name}`, "info");

  try {
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

    excelData.value = data.reduce((acc, curr) => {
      if (!curr.postcode || !curr.nr) return acc;

      const type = curr.Type || "Unknown";
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push({
        adres: curr.adres || "",
        postcode: curr.postcode,
        nr: curr.nr,
        "GEO-type": curr["GEO-type"] || "",
        Type: type,
        plaats: curr.plaats || "Breda",
      });
      return acc;
    }, {} as Record<string, ExcelRow[]>);

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
  addDebugMessage(`XML bestand verwerken: ${file.name}`, "info");

  try {
    const text = await file.text();
    if (!text || text.length === 0) {
      throw new Error("XML bestand is leeg");
    }

    xmlContent.value = text;
    addDebugMessage("XML template succesvol geladen", "success");
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
  let formatted = "";
  let indent = "";
  const tab = "  "; // 2 spaties als indentatie

  xml.split(/>\s*</).forEach((node) => {
    if (node.match(/^\/\w/)) {
      // Sluitende tag: verminderen indentatie
      indent = indent.slice(tab.length);
    }

    formatted += `${indent}<${node}>\n`;

    if (node.match(/^<?\w[^>]*[^/]$/) && !node.match(/^<!/)) {
      // Openende tag (geen zelfsluitende tag of commentaar): vergroten indentatie
      indent += tab;
    }
  });

  return formatted.trim();
};

const generateXmlFiles = () => {
  if (!xmlContent.value || !mainHouseKey.value) {
    addDebugMessage("Geen XML-template of hoofdwoning geselecteerd", "error");
    return;
  }

  if (!excelData.value || Object.keys(excelData.value).length === 0) {
    addDebugMessage("Geen Excel data beschikbaar", "error");
    return;
  }

  isGeneratingXml.value = true;
  addDebugMessage("XML-bestanden genereren...", "info");
  generatedXmlFiles.value = [];

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent.value, "text/xml");

    // Controleer op parsefouten
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      throw new Error("Ongeldige XML-template: " + parseError[0].textContent);
    }

    // Hoofdwoning ophalen
    const [mainPostcode, mainNr] = mainHouseKey.value.split("-");
    const mainHouse = Object.values(excelData.value)
      .flat()
      .find(
        (row) => row.postcode === mainPostcode && row.nr.toString() === mainNr
      );

    if (!mainHouse) {
      throw new Error(
        `Geen Excel-data gevonden voor hoofdwoning ${mainHouseKey.value}`
      );
    }

    const newDoc = xmlDoc.cloneNode(true) as Document;
    const projectData = newDoc.getElementsByTagName("Adresgegevens")[0];
    const registratieData = newDoc.getElementsByTagName(
      "RegistratiegegevensInvoer"
    )[0];

    if (!projectData || !registratieData) {
      throw new Error(
        "XML-template mist vereiste elementen: Adresgegevens of RegistratiegegevensInvoer"
      );
    }

    // Functie om elementen in te stellen of toe te voegen
    const setOrUpdateElement = (
      parent: Element,
      tag: string,
      value: string
    ) => {
      let elem = parent.getElementsByTagName(tag)[0];
      if (!elem) {
        elem = newDoc.createElement(tag);
        parent.appendChild(elem);
      }
      elem.textContent = value;
    };

    // Hoofdwoning invullen
    setOrUpdateElement(projectData, "Straat", mainHouse.adres || "");
    setOrUpdateElement(projectData, "Huisnummer", mainHouse.nr.toString());
    setOrUpdateElement(projectData, "Postcode", mainHouse.postcode);
    setOrUpdateElement(projectData, "Woonplaats", mainHouse.plaats || "Breda");

    // Representatieve woningen instellen
    setOrUpdateElement(
      registratieData,
      "RepresentatieveWoningen",
      referenceHouses.value.size > 0 ? "1" : "0"
    );

    // Referentie-woningen toevoegen
    let objRegList = registratieData.getElementsByTagName(
      "ObjectRegistratieRepresentatiefLijstInvoer"
    )[0];
    if (!objRegList) {
      objRegList = newDoc.createElement(
        "ObjectRegistratieRepresentatiefLijstInvoer"
      );
      objRegList.setAttribute("Index", "-1");
      registratieData.appendChild(objRegList);
    }

    // Verwijder bestaande inhoud en voeg GUID toe
    while (objRegList.childNodes.length > 0) {
      objRegList.removeChild(objRegList.lastChild!);
    }
    const guidList = newDoc.createElement("Guid");
    guidList.textContent = generateUuid();
    objRegList.appendChild(guidList);

    if (referenceHouses.value.size > 0) {
      let index = 1;
      for (const refKey of referenceHouses.value) {
        const [refPostcode, refNr] = refKey.split("-");
        const refHouse = Object.values(excelData.value)
          .flat()
          .find(
            (row) => row.postcode === refPostcode && row.nr.toString() === refNr
          );

        if (!refHouse) continue;

        const newRef = newDoc.createElement(
          "ObjectRegistratieRepresentatiefInvoer"
        );
        newRef.setAttribute("Index", index.toString());

        const guidRef = newDoc.createElement("Guid");
        guidRef.textContent = generateUuid();
        newRef.appendChild(guidRef);

        setOrUpdateElement(newRef, "Huisnummer", refHouse.nr.toString());
        setOrUpdateElement(newRef, "HuisletterHuisnummertoevoeging", "");
        setOrUpdateElement(newRef, "Detailaanduiding", "");
        setOrUpdateElement(newRef, "Postcode", refHouse.postcode);
        setOrUpdateElement(newRef, "BagPandId", "");
        setOrUpdateElement(newRef, "BagStandplaatsId", "");
        setOrUpdateElement(newRef, "BagLigplaatsId", "");
        setOrUpdateElement(newRef, "BagObjectId", "");
        setOrUpdateElement(newRef, "ProvisionalId", "");

        objRegList.appendChild(newRef);
        index++;
      }
    }

    const serializer = new XMLSerializer();
    const rawXmlContent = serializer.serializeToString(newDoc);
    const formattedXmlContent = formatXml(rawXmlContent);

    generatedXmlFiles.value.push({
      filename: `${mainHouse.Type}_${mainPostcode}_${mainNr}.xml`,
      content: formattedXmlContent,
    });

    addDebugMessage(`1 XML-bestand gegenereerd`, "success");
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
    const blob = new Blob([file.content], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.filename;
    link.click();
    URL.revokeObjectURL(url);
  });
  addDebugMessage("XML bestanden gedownload", "success");
};

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    const file = input.files[0];
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
  if (excelFileInput.value) {
    excelFileInput.value.value = "";
  }
  addDebugMessage("Excel herlaad modus geactiveerd", "info");
};

const reloadXml = () => {
  xmlContent.value = "";
  if (xmlFileInput.value) {
    xmlFileInput.value.value = "";
  }
  addDebugMessage("XML herlaad modus geactiveerd", "info");
};
</script>
