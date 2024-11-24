(function() {
  // HTML-Code als String
  const formularHTML = `
    <form id="schadensrechner-form">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" required>

      <label for="gegenstand">Schadensgegenstand:</label>
      <input type="text" id="gegenstand" name="gegenstand" required>

      <label for="schaedenhoehe">Voraussichtliche Schadenshöhe (€):</label>
      <input type="number" id="schaedenhoehe" name="schaedenhoehe" required>

      <label for="ort">Ort der Begutachtung (Adresse eingeben):</label>
      <input type="text" id="ort" name="ort" required>

      <button type="submit">Berechnen</button>
    </form>
    <div id="ergebnis"></div>
  `;

  // Funktion zur Initialisierung des Schadensrechners
  function initialisiereSchadensrechner() {
    const container = document.getElementById('schadensrechner-widget');

    if (container) {
      container.innerHTML = formularHTML;
      hinzufuegenEventListener();
    } else {
      console.error('Container für den Schadensrechner nicht gefunden.');
    }
  }

  // Funktion zum Hinzufügen des Event Listeners
  function hinzufuegenEventListener() {
    const formular = document.getElementById('schadensrechner-form');
    formular.addEventListener('submit', function(e) {
      e.preventDefault();

      const daten = {
        name: document.getElementById('name').value,
        gegenstand: document.getElementById('gegenstand').value,
        schaedenhoehe: parseFloat(document.getElementById('schaedenhoehe').value),
        ort: document.getElementById('ort').value,
      };

      // Berechnung der Begutachtungsdauer und Gutachtenerstellungsdauer
      const zeiten = berechneZeiten(daten.schaedenhoehe);
      daten.begutachtungsdauer = zeiten.begutachtungsdauer;
      daten.erstellungsdauer = zeiten.erstellungsdauer;

      const bueroLat = 52.2801732; // Breitengrad Ihres Büros
      const bueroLon = 10.4958380; // Längengrad Ihres Büros

      // Geocoding des Ortes der Begutachtung
      geocodeAdresseNominatim(daten.ort, function(koordinatenZiel) {
        const zielLon = koordinatenZiel[0];
        const zielLat = koordinatenZiel[1];

        // Entfernung berechnen
        let entfernungInKm = berechneEntfernungHaversine(
          bueroLat,
          bueroLon,
          zielLat,
          zielLon
        );

        // Pauschalen Prozentsatz hinzufügen
        const faktor = 1.3; // Erhöhen um 30%
        entfernungInKm = entfernungInKm * faktor;

        // Entfernung auf die nächsten 5 km abrunden
        entfernungInKm = Math.floor(entfernungInKm / 5) * 5;

        daten.strecke = entfernungInKm;

        // Berechnung durchführen
        const ergebnis = berechneBegutachtungskosten(daten);

        // Ergebnis anzeigen
        zeigeErgebnisAn(daten, ergebnis);
      });
    });
  }

  // Funktion zur Berechnung der Zeiten basierend auf der Schadenshöhe
  function berechneZeiten(schaedenhoehe) {
    let begutachtungsdauer;
    let erstellungsdauer;

    if (schaedenhoehe <= 1000) {
      begutachtungsdauer = 1;
      erstellungsdauer = 2;
    } else if (schaedenhoehe <= 2500) {
      begutachtungsdauer = 1;
      erstellungsdauer = 3;
    } else if (schaedenhoehe <= 5000) {
      begutachtungsdauer = 2;
      erstellungsdauer = 3;
    } else if (schaedenhoehe <= 10000) {
      begutachtungsdauer = 3;
      erstellungsdauer = 4;
    } else if (schaedenhoehe <= 30000) {
      begutachtungsdauer = 5;
      erstellungsdauer = 6;
    } else if (schaedenhoehe <= 75000) {
      begutachtungsdauer = 6;
      erstellungsdauer = 8;
    } else if (schaedenhoehe <= 100000) {
      begutachtungsdauer = 8;
      erstellungsdauer = 10;
    } else if (schaedenhoehe <= 250000) {
      begutachtungsdauer = 12;
      erstellungsdauer = 10;
    } else {
      // Für Schadenshöhen über 250.000 €
      begutachtungsdauer = 15;
      erstellungsdauer = 12;
    }

    // Zeiten auf die nächste halbe Stunde aufrunden
    begutachtungsdauer = Math.ceil(begutachtungsdauer * 2) / 2;
    erstellungsdauer = Math.ceil(erstellungsdauer * 2) / 2;

    return {
      begutachtungsdauer: begutachtungsdauer,
      erstellungsdauer: erstellungsdauer,
    };
  }

  // Funktion zur Geokodierung mit Nominatim API
  function geocodeAdresseNominatim(adresse, callback) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      adresse
    )}&limit=1&addressdetails=1`;

    fetch(url, {
      method: 'GET',
      headers: {
        'Accept-Language': 'de', // Optional: Sprache auf Deutsch setzen
      }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const koordinaten = [
            parseFloat(data[0].lon),
            parseFloat(data[0].lat),
          ];
          callback(koordinaten);
        } else {
          alert('Adresse konnte nicht gefunden werden: ' + adresse);
        }
      })
      .catch((error) => {
        console.error('Fehler beim Geocoding:', error);
        alert('Adresse konnte nicht gefunden werden: ' + adresse);
      });
  }

  // Funktion zur Berechnung der Entfernung mit der Haversine-Formel
  function berechneEntfernungHaversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Erdradius in Kilometern
    const dLat = gradZuBogenmass(lat2 - lat1);
    const dLon = gradZuBogenmass(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(gradZuBogenmass(lat1)) *
        Math.cos(gradZuBogenmass(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const entfernung = R * c;
    return entfernung; // Entfernung in Kilometern
  }

  function gradZuBogenmass(deg) {
    return deg * (Math.PI / 180);
  }

  // Funktion zur Berechnung der Begutachtungskosten
  function berechneBegutachtungskosten(daten) {
    const strecke = parseFloat(daten.strecke);
    const begutachtungsdauer = parseFloat(daten.begutachtungsdauer);
    const erstellungsdauer = parseFloat(daten.erstellungsdauer);
    const schaedenhoehe = parseFloat(daten.schaedenhoehe);

    const kostenAnfahrtspauschale = 0.8 * strecke;
    const kostenAnfahrt = (strecke / 100) * 85;
    const kostenErstellung = erstellungsdauer * 85;
    const kostenBegutachtung = begutachtungsdauer * 105;

    // Neue Kostenposition: 5 % der Schadenshöhe
    const kostenProzentSchadenshoehe = (schaedenhoehe * 0.05);

    const gesamtKosten = kostenAnfahrtspauschale + kostenAnfahrt + kostenErstellung + kostenBegutachtung + kostenProzentSchadenshoehe;

    return {
      kostenAnfahrtspauschale: kostenAnfahrtspauschale.toFixed(2),
      kostenAnfahrt: kostenAnfahrt.toFixed(2),
      kostenErstellung: kostenErstellung.toFixed(2),
      kostenBegutachtung: kostenBegutachtung.toFixed(2),
      kostenProzentSchadenshoehe: kostenProzentSchadenshoehe.toFixed(2),
      gesamtKosten: gesamtKosten.toFixed(2),
    };
  }

  // Funktion zur Anzeige des Ergebnisses
  function zeigeErgebnisAn(daten, ergebnis) {
    document.getElementById('ergebnis').innerHTML = `
      <h2>Ergebnis</h2>
      <p><strong>Name:</strong> ${daten.name}</p>
      <p><strong>Schadensgegenstand:</strong> ${daten.gegenstand}</p>
      <p><strong>Voraussichtliche Schadenshöhe:</strong> ${daten.schaedenhoehe} €</p>
      <p><strong>Ort der Begutachtung:</strong> ${daten.ort}</p>
      <p><strong>Berechnete Anfahrtsstrecke:</strong> ${daten.strecke} km</p>
      <p><strong>Begutachtungsdauer:</strong> ${daten.begutachtungsdauer} Stunden</p>
      <p><strong>Gutachtenerstellungsdauer:</strong> ${daten.erstellungsdauer} Stunden</p>
      <hr>
      <p><strong>Kosten Anfahrtspauschale:</strong> ${ergebnis.kostenAnfahrtspauschale} €</p>
      <p><strong>Kosten Anfahrt:</strong> ${ergebnis.kostenAnfahrt} €</p>
      <p><strong>Kosten Gutachtenerstellung:</strong> ${ergebnis.kostenErstellung} €</p>
      <p><strong>Kosten Begutachtung:</strong> ${ergebnis.kostenBegutachtung} €</p>
      <p><strong>Kosten (5% der Schadenshöhe):</strong> ${ergebnis.kostenProzentSchadenshoehe} €</p>
      <hr>
      <h3>Gesamtkosten: ${ergebnis.gesamtKosten} €</h3>
    `;
  }

  // Initialisierung des Widgets
  initialisiereSchadensrechner();
})();
