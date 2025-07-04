<template>
  <div class="space-y-4">
    <!-- Export Button -->
    <div class="flex justify-end">
      <button
        @click="exportToExcel"
        class="text-sm text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
      >
        <DocumentArrowDownIcon class="h-4 w-4" />
        Exporteer naar Excel
      </button>
    </div>

    <!-- Building Details Section -->
    <div v-if="results.length > 0" class="bg-white shadow rounded-lg divide-y">
      <!-- Main Result -->
      <div
        v-for="(result, index) in results"
        :key="index"
        class="bg-white shadow overflow-hidden sm:rounded-lg"
      >
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Resultaat</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            BAG informatie voor dit adres
          </p>
        </div>

        <!-- Basic Information -->
        <div class="border-b border-gray-200">
          <dl>
            <div
              class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">Adres</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                {{ result.address || "Onbekend" }}
              </dd>
            </div>
            <div
              class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">Gebruiksdoel</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                {{ result.gebruiksdoel || "Onbekend" }}
              </dd>
            </div>
            <div
              class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">Bouwjaar</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                {{ result.bouwjaar || "Onbekend" }}
              </dd>
            </div>
            <div
              class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">Status</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                {{ result.status || "Onbekend" }}
              </dd>
            </div>
            <div
              class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">Oppervlakte</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                {{
                  result.oppervlakte ? `${result.oppervlakte} m²` : "Onbekend"
                }}
              </dd>
            </div>
            <div
              class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">Gemeente</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                {{ result.gemeente || "Onbekend" }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Technical Details -->
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h4 class="text-base font-medium text-gray-900">
            Technische Details
          </h4>
        </div>
        <div class="border-b border-gray-200">
          <dl>
            <div
              class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">
                Nummeraanduiding ID
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                {{ result.nummeraanduidingId || "Onbekend" }}
              </dd>
            </div>
            <div
              class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">
                Verblijfsobject ID
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                {{ result.verblijfsobjectId || "Onbekend" }}
              </dd>
            </div>
            <div
              class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">Pand ID</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                {{ result.pandId || "Onbekend" }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Related Addresses -->
        <div
          v-if="result.relatedAddresses && result.relatedAddresses.length > 0"
        >
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h4 class="text-base font-medium text-gray-900">
              Gerelateerde Adressen in dit Pand
            </h4>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Andere adressen die in hetzelfde gebouw zijn geregistreerd
            </p>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Straat
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Huisnummer
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Huisletter
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Toevoeging
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Postcode
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Plaats
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Gebruiksdoel
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Oppervlakte
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nummeraanduiding ID
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Verblijfsobject ID
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Gemeente
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="(related, rIndex) in result.relatedAddresses"
                  :key="rIndex"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ related.street || "Onbekend" }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ related.houseNumber || "Onbekend" }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ related.houseLetter || "-" }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ related.houseNumberAddition || "-" }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ related.postalCode || "Onbekend" }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ related.city || "Onbekend" }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ related.gebruiksdoel || "Onbekend" }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{
                      related.oppervlakte
                        ? `${related.oppervlakte} m²`
                        : "Onbekend"
                    }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ related.status || "Onbekend" }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ related.nummeraanduidingId || "Onbekend" }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ related.verblijfsobjectId || "Onbekend" }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ related.gemeente || "Onbekend" }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Debug Info -->
      <div v-if="debugInfo" class="pt-12 pb-16 flex flex-col items-center">
        <button
          @click="showDebug = !showDebug"
          class="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <span>{{ showDebug ? "Verberg" : "Toon" }} debug informatie</span>
          <ChevronDownIcon v-if="!showDebug" class="h-4 w-4" />
          <ChevronUpIcon v-else class="h-4 w-4" />
        </button>
        <div
          v-show="showDebug"
          class="mt-4 p-4 bg-gray-100 rounded-md text-sm w-full"
        >
          <pre class="whitespace-pre-wrap">{{ debugInfo }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentArrowDownIcon,
} from "@heroicons/vue/24/outline";
import * as XLSX from "xlsx";

interface RelatedAddress {
  nummeraanduidingId: string;
  verblijfsobjectId: string;
  address: string;
  street: string;
  houseNumber: string;
  houseLetter: string;
  houseNumberAddition: string;
  postalCode: string;
  city: string;
  gebruiksdoel: string;
  oppervlakte: string | number;
  status: string;
  gemeente: string;
}

interface BuildingResult {
  address: string;
  street: string;
  houseNumber: string;
  houseLetter: string;
  houseNumberAddition: string;
  postalCode: string;
  city: string;
  gebruiksdoel: string;
  bouwjaar: string;
  status: string;
  oppervlakte: string | number;
  gemeente: string;
  nummeraanduidingId: string;
  verblijfsobjectId: string;
  pandId?: string;
  relatedAddresses?: RelatedAddress[];
}

const props = defineProps<{
  results: BuildingResult[];
  debugInfo?: string;
}>();

const showDebug = ref(false);

const exportToExcel = () => {
  // Prepare data for export
  const exportData: any[] = [];

  props.results.forEach((result) => {
    // Add main building data
    const mainData = {
      Type: "Hoofdadres",
      Straat: result.street || "Onbekend",
      Huisnummer: result.houseNumber || "Onbekend",
      Huisletter: result.houseLetter || "-",
      "Huisnummer toevoeging": result.houseNumberAddition || "-",
      Postcode: result.postalCode || "Onbekend",
      Plaats: result.city || "Onbekend",
      Gebruiksdoel: result.gebruiksdoel || "Onbekend",
      Bouwjaar: result.bouwjaar || "Onbekend",
      Status: result.status || "Onbekend",
      "Oppervlakte (m²)": result.oppervlakte || "Onbekend",
      Gemeente: result.gemeente || "Onbekend",
      "Nummeraanduiding ID": result.nummeraanduidingId || "Onbekend",
      "Verblijfsobject ID": result.verblijfsobjectId || "Onbekend",
      "Pand ID": result.pandId || "Onbekend",
    };
    exportData.push(mainData);

    // Add related addresses as separate rows
    if (result.relatedAddresses && result.relatedAddresses.length > 0) {
      result.relatedAddresses.forEach((related: RelatedAddress) => {
        exportData.push({
          Type: "Gerelateerd adres",
          Straat: related.street || "Onbekend",
          Huisnummer: related.houseNumber || "Onbekend",
          Huisletter: related.houseLetter || "-",
          "Huisnummer toevoeging": related.houseNumberAddition || "-",
          Postcode: related.postalCode || "Onbekend",
          Plaats: related.city || "Onbekend",
          Gebruiksdoel: related.gebruiksdoel || "Onbekend",
          Bouwjaar: result.bouwjaar || "Onbekend", // Using main building's year
          Status: related.status || "Onbekend",
          "Oppervlakte (m²)": related.oppervlakte || "Onbekend",
          Gemeente: related.gemeente || "Onbekend",
          "Nummeraanduiding ID": related.nummeraanduidingId || "Onbekend",
          "Verblijfsobject ID": related.verblijfsobjectId || "Onbekend",
          "Pand ID": result.pandId || "Onbekend",
        });
      });
    }
  });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Auto-size columns
  const colWidths: { [key: string]: number } = {};
  exportData.forEach((row) => {
    Object.keys(row).forEach((key) => {
      const value = String(row[key]);
      colWidths[key] = Math.max(colWidths[key] || key.length, value.length);
    });
  });

  ws["!cols"] = Object.keys(colWidths).map((key) => ({
    wch: Math.min(colWidths[key] + 2, 50),
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "BAG Gegevens");

  // Generate Excel file
  const now = new Date();
  const timestamp = now.toISOString().split("T")[0];
  XLSX.writeFile(wb, `bag-gegevens-${timestamp}.xlsx`);
};
</script>
