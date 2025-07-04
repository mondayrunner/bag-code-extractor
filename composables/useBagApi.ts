import { ref, nextTick } from "vue";

interface SearchResult {
  nummeraanduidingId: string;
  verblijfsobjectId: string;
  address: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  gebruiksdoel: string;
  bouwjaar?: string;
  status: string;
  oppervlakte: string | number;
  gemeente: string;
  pandId?: string;
  relatedAddresses: SearchResult[];
  timestamp?: number;
}

interface SearchHistoryItem {
  id: string;
  lastSearched: number;
  results: SearchResult[];
}

interface SearchHistory {
  [key: string]: SearchHistoryItem;
}

interface BagApiResponse {
  _links: {
    self: { href: string };
    next?: { href: string }; // The next page link if available
  };
  _embedded: {
    adressen?: any[];
    verblijfsobjecten?: any[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

// Create shared state outside the composable
const results = ref<SearchResult[]>([]);
const loading = ref(false);
const error = ref("");
const debugInfo = ref("");
const searchHistory = ref<SearchHistory>({});
const initialized = ref(false);

export const useBagApi = () => {
  console.log("Initializing useBagApi");

  const config = useRuntimeConfig();
  const baseUrl = "https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2";
  const apiKey = config.public.bagApiKey;

  // Load search history from localStorage
  const loadSearchHistory = () => {
    console.log("Loading search history, initialized:", initialized.value);
    if (process.client && !initialized.value) {
      try {
        const stored = localStorage.getItem("bagSearchHistory");
        console.log("Stored history:", stored);
        if (stored) {
          searchHistory.value = JSON.parse(stored);
          console.log("Parsed history:", searchHistory.value);
        }
        initialized.value = true;
      } catch (err) {
        console.error("Error loading search history:", err);
      }
    }
  };

  // Save search history to localStorage
  const saveSearchHistory = () => {
    console.log("Saving search history:", searchHistory.value);
    if (process.client) {
      try {
        localStorage.setItem(
          "bagSearchHistory",
          JSON.stringify(searchHistory.value)
        );
        console.log("History saved successfully");
      } catch (err) {
        console.error("Error saving search history:", err);
      }
    }
  };

  // Add search result to history
  const addToHistory = (searchResults: SearchResult[]) => {
    console.log("Adding to history:", searchResults);
    if (!searchResults.length) return;

    const timestamp = Date.now();
    const address = searchResults[0].address;
    const id = `${timestamp}`;

    // Update or add to history
    searchHistory.value[address] = {
      id,
      lastSearched: timestamp,
      results: searchResults.map((result) => ({
        ...result,
        timestamp,
      })),
    };

    console.log("Updated history:", searchHistory.value);
    saveSearchHistory();
  };

  // Get sorted search history
  const getSortedHistory = () => {
    console.log("Getting sorted history");
    loadSearchHistory(); // Ensure history is loaded when needed
    const sorted = Object.entries(searchHistory.value)
      .sort(([, a], [, b]) => b.lastSearched - a.lastSearched)
      .map(([address, data]) => ({
        address,
        id: data.id,
        lastSearched: data.lastSearched,
        results: data.results,
      }));
    console.log("Sorted history:", sorted);
    return sorted;
  };

  // Clear search history
  const clearHistory = () => {
    console.log("Clearing history");
    searchHistory.value = {};
    saveSearchHistory();
  };

  // Load history on initialization
  if (process.client) {
    console.log("Client-side initialization");
    nextTick(() => {
      loadSearchHistory();
    });
  }

  const fetchBagData = async (postcode: string, huisnummer: string) => {
    loading.value = true;
    error.value = "";
    debugInfo.value = "";
    results.value = [];

    try {
      const formattedPostcode = postcode.replace(/\s+/g, "").toUpperCase();
      const apiUrl = `/api/bag/nummeraanduidingen?postcode=${formattedPostcode}&huisnummer=${huisnummer}`;

      debugInfo.value = `Fetching from URL: ${apiUrl}\n`;

      // First, get the nummeraanduiding
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const responseText = await response.text();
        debugInfo.value += `API Response (${response.status}): ${responseText}\n`;
        throw new Error(
          `Failed to fetch address data: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      debugInfo.value += `Initial response: ${JSON.stringify(data, null, 2)}\n`;

      if (!data._embedded?.nummeraanduidingen) {
        throw new Error("No results found for this address");
      }

      // Process the first nummeraanduiding to get the pand-id
      const nummeraanduiding = data._embedded.nummeraanduidingen[0];
      const nummerIdentificatie =
        nummeraanduiding.nummeraanduiding.identificatie;

      // Get verblijfsobject to find the pand-id
      const verblijfsobjectUrl = `/api/bag/adresseerbareobjecten?nummeraanduidingIdentificatie=${nummerIdentificatie}`;
      debugInfo.value += `Fetching verblijfsobject from: ${verblijfsobjectUrl}\n`;

      const verblijfsobjectResponse = await fetch(verblijfsobjectUrl);

      if (!verblijfsobjectResponse.ok) {
        throw new Error("Failed to fetch verblijfsobject data");
      }

      const verblijfsobjectData = await verblijfsobjectResponse.json();
      debugInfo.value += `Verblijfsobject data: ${JSON.stringify(
        verblijfsobjectData,
        null,
        2
      )}\n`;

      if (!verblijfsobjectData._embedded?.adresseerbareObjecten?.[0]) {
        throw new Error("No verblijfsobject found");
      }

      const verblijfsobject =
        verblijfsobjectData._embedded.adresseerbareObjecten[0];
      const pandId =
        verblijfsobject.verblijfsobject?.verblijfsobject?.maaktDeelUitVan?.[0];

      if (!pandId) {
        throw new Error("No pand-id found for this address");
      }

      // Now use fetchBagDataByPandId to get all addresses in a consistent format
      await fetchBagDataByPandId(pandId);
    } catch (err: any) {
      error.value = err.message || "An error occurred while fetching the data";
      debugInfo.value += `Error: ${err.message}\n`;
      if (err.stack) {
        debugInfo.value += `Stack: ${err.stack}\n`;
      }
    } finally {
      loading.value = false;
    }
  };

  const fetchBuildingAddresses = async (buildingId: string) => {
    const addresses: any[] = [];
    let currentUrl = `/api/bag/verblijfsobjecten/${buildingId}/adressen`;
    let pageCount = 0;

    try {
      // Keep fetching until we have all pages
      while (currentUrl) {
        pageCount++;
        console.log(`Fetching page ${pageCount} from URL:`, currentUrl);

        const response = await fetch(currentUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch addresses");
        }

        const data: BagApiResponse = await response.json();
        console.log("Response data:", {
          totalElements: data.page?.totalElements,
          currentPage: data.page?.number,
          totalPages: data.page?.totalPages,
          pageSize: data.page?.size,
          hasNextPage: !!data._links?.next,
          nextUrl: data._links?.next?.href,
          addressesInThisPage: data._embedded?.adressen?.length,
        });

        if (data._embedded?.adressen) {
          addresses.push(...data._embedded.adressen);
        }

        // Check if there's a next page and update URL to use our proxy
        if (data._links?.next?.href) {
          currentUrl = `/api/bag/${data._links.next.href.split("/v2/")[1]}`;
        } else {
          currentUrl = "";
        }
      }

      console.log(`Total addresses fetched: ${addresses.length}`);
      return addresses;
    } catch (error) {
      console.error("Error fetching building addresses:", error);
      throw error;
    }
  };

  const fetchVerblijfsobjectenForPand = async (pandId: string) => {
    const verblijfsobjecten: any[] = [];
    let currentUrl = `/api/bag/verblijfsobjecten?pandIdentificatie=${pandId}`;

    try {
      // Keep fetching until we have all pages
      while (currentUrl) {
        const response = await fetch(currentUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch verblijfsobjecten");
        }

        const data: BagApiResponse = await response.json();

        if (data._embedded?.verblijfsobjecten) {
          // Map the data to the correct structure before pushing
          const mappedVerblijfsobjecten = data._embedded.verblijfsobjecten.map(
            (item) => ({
              verblijfsobject: item,
            })
          );
          verblijfsobjecten.push(...mappedVerblijfsobjecten);
        }

        // Check if there's a next page and update URL to use our proxy
        if (data._links?.next?.href) {
          currentUrl = `/api/bag/${data._links.next.href.split("/v2/")[1]}`;
        } else {
          currentUrl = "";
        }
      }

      return verblijfsobjecten;
    } catch (error) {
      console.error("Error fetching verblijfsobjecten:", error);
      throw error;
    }
  };

  const fetchBagDataByPandId = async (pandId: string) => {
    loading.value = true;
    error.value = "";
    debugInfo.value = "";
    results.value = [];

    try {
      // Get pand details first
      const pandUrl = `/api/bag/panden/${pandId}`;
      debugInfo.value += `Fetching pand details from: ${pandUrl}\n`;

      const pandResponse = await fetch(pandUrl);
      if (!pandResponse.ok) {
        throw new Error("Pand niet gevonden");
      }

      const pandData = await pandResponse.json();
      debugInfo.value += `Pand data: ${JSON.stringify(pandData, null, 2)}\n`;

      // Get all verblijfsobjecten for this pand
      const allVerblijfsobjecten = await fetchVerblijfsobjectenForPand(pandId);
      debugInfo.value += `All verblijfsobjecten in pand: ${JSON.stringify(
        { _embedded: { verblijfsobjecten: allVerblijfsobjecten } },
        null,
        2
      )}\n`;

      // Process each verblijfsobject
      const relatedAddresses = [];
      for (const verblijfsobject of allVerblijfsobjecten) {
        // Get the nummeraanduiding for this verblijfsobject
        const nummeraanduidingUrl =
          verblijfsobject.verblijfsobject._links.heeftAlsHoofdAdres.href;
        debugInfo.value += `\nFetching nummeraanduiding from: ${nummeraanduidingUrl}\n`;

        const nummeraanduidingResponse = await fetch(
          `/api/bag/${nummeraanduidingUrl.split("/v2/")[1]}`
        );

        if (nummeraanduidingResponse.ok) {
          const nummeraanduidingData = await nummeraanduidingResponse.json();
          debugInfo.value += `Nummeraanduiding data: ${JSON.stringify(
            nummeraanduidingData,
            null,
            2
          )}\n`;

          // Get street name and city
          const streetResponse = await fetch(
            `/api/bag/${
              nummeraanduidingData._links.ligtAanOpenbareRuimte.href.split(
                "/v2/"
              )[1]
            }`
          );
          const woonplaatsResponse = await fetch(
            `/api/bag/${
              nummeraanduidingData._links.ligtInWoonplaats.href.split("/v2/")[1]
            }`
          );

          let streetName = "";
          let woonplaatsName = "";

          if (streetResponse.ok) {
            const streetData = await streetResponse.json();
            streetName = streetData.openbareRuimte?.naam || "";
            debugInfo.value += `Street data: ${JSON.stringify(
              streetData,
              null,
              2
            )}\n`;
          }
          if (woonplaatsResponse.ok) {
            const woonplaatsData = await woonplaatsResponse.json();
            woonplaatsName = woonplaatsData.woonplaats?.naam || "";
            debugInfo.value += `Woonplaats data: ${JSON.stringify(
              woonplaatsData,
              null,
              2
            )}\n`;
          }

          relatedAddresses.push({
            nummeraanduidingId:
              nummeraanduidingData.nummeraanduiding.identificatie,
            verblijfsobjectId:
              verblijfsobject.verblijfsobject.verblijfsobject.identificatie,
            address: `${streetName} ${
              nummeraanduidingData.nummeraanduiding.huisnummer
            }${nummeraanduidingData.nummeraanduiding.huisletter || ""}, ${
              nummeraanduidingData.nummeraanduiding.postcode
            } ${woonplaatsName}`,
            street: streetName,
            houseNumber: `${nummeraanduidingData.nummeraanduiding.huisnummer}${
              nummeraanduidingData.nummeraanduiding.huisletter || ""
            }`,
            postalCode: nummeraanduidingData.nummeraanduiding.postcode || "",
            city: woonplaatsName,
            gebruiksdoel:
              verblijfsobject.verblijfsobject.verblijfsobject
                .gebruiksdoelen?.[0] || "Onbekend",
            oppervlakte:
              verblijfsobject.verblijfsobject.verblijfsobject.oppervlakte ||
              "Onbekend",
            status:
              verblijfsobject.verblijfsobject.verblijfsobject.status ||
              "Onbekend",
            gemeente: woonplaatsName || "Onbekend",
          });
        }
      }

      // Add the first address as the main result
      if (relatedAddresses.length > 0) {
        const mainAddress = relatedAddresses.shift();
        results.value.push({
          ...mainAddress,
          pandId,
          bouwjaar: pandData.pand?.oorspronkelijkBouwjaar || "Onbekend",
          relatedAddresses,
        });
      }

      // Add results to history after successful fetch
      if (process.client) {
        console.log("Adding search results to history");
        addToHistory(results.value);
      }
    } catch (err: any) {
      error.value = err.message || "An error occurred while fetching the data";
      debugInfo.value += `Error: ${err.message}\n`;
      if (err.stack) {
        debugInfo.value += `Stack: ${err.stack}\n`;
      }
    } finally {
      loading.value = false;
    }
  };

  return {
    results,
    loading,
    error,
    debugInfo,
    fetchBagData,
    fetchBagDataByPandId,
    searchHistory: {
      items: searchHistory,
      getSorted: getSortedHistory,
      clear: clearHistory,
    },
    fetchBuildingAddresses,
  };
};
