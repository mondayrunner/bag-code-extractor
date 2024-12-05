# BAG Code Extractor

Een gebruiksvriendelijke web-applicatie voor het opzoeken en exporteren van BAG (Basisregistratie Adressen en Gebouwen) gegevens. Deze tool maakt het gemakkelijk om gebouwinformatie op te zoeken en te exporteren naar Excel.

## Features

- 🏠 Snel zoeken op postcode en huisnummer
- 📊 Direct inzicht in BAG gegevens:
  - Adresgegevens
  - Gebruiksdoel
  - Oppervlakte
  - Bouwjaar
  - Status
  - BAG identificatienummers
  - Coördinaten
- 🏢 Automatisch gerelateerde adressen in hetzelfde pand vinden
- 📑 Zoekgeschiedenis met eerdere zoekopdrachten
- 📥 Export naar Excel met alle relevante gegevens
- 🗺️ Kaartweergave van gevonden locaties

## Technische Details

### Gebouwd met

- [Nuxt 3](https://nuxt.com/) - Het Vue.js Framework
- [Tailwind CSS](https://tailwindcss.com/) - Voor styling
- [BAG API](https://www.kadaster.nl/zakelijk/producten/adressen-en-gebouwen/bag-api) - Voor gebouwinformatie
- [XLSX](https://www.npmjs.com/package/xlsx) - Voor Excel exports

### Vereisten

- Node.js 16.x of hoger
- BAG API key (aan te vragen bij het Kadaster)

### Installatie

1. Clone de repository

```bash
git clone https://github.com/yourusername/bag-code-extractor.git
cd bag-code-extractor
```

2. Installeer dependencies

```bash
npm install
```

3. Maak een `.env` bestand aan met je BAG API key

```
BAG_API_KEY=your_api_key_here
```

4. Start de development server

```bash
npm run dev
```

De applicatie is nu beschikbaar op `http://localhost:3000`

### Productie build

```bash
npm run build
```

## Gebruik

1. Voer een postcode en huisnummer in
2. De applicatie haalt automatisch alle beschikbare BAG gegevens op
3. Als er meerdere adressen in hetzelfde pand zijn, worden deze ook getoond
4. Exporteer de gegevens naar Excel met de 'Excel downloaden' knop
5. Bekijk eerdere zoekopdrachten in de geschiedenis

## API Documentatie

De applicatie maakt gebruik van de volgende BAG API endpoints:

- `/adressenuitgebreid` - Voor gedetailleerde adresgegevens
- Alle API calls worden geproxied via de server om de API key veilig te houden

## Bijdragen

Bijdragen zijn welkom! Voor grote wijzigingen, open eerst een issue om te bespreken wat je wilt veranderen.

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## Licentie

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## Contact

Voor vragen of suggesties, open een issue in de GitHub repository.
