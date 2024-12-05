export interface SearchResult {
  identificatie: string
  postcode: string
  huisnummer: string
  huisletter?: string
  huisnummertoevoeging?: string
  straat: string
  woonplaats: string
  status: string
  gebruiksdoel: string[]
  oppervlakte?: number
  bouwjaar?: string
  bagNummeraanduidingId: string
  geometry?: {
    coordinates: [number, number]
  }
  nevenadres?: boolean
  relatedAddresses?: SearchResult[]
  documentdatum?: string
  documentnummer?: string
  voorkomenidentificatie?: number
} 