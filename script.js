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

      <label for="begutachtungsdauer">Begutachtungsdauer (Stunden):</label>
      <input type="number" id="begutachtungsdauer" name="begutachtungsdauer" required>

      <label for="erstellungsdauer">Gutachtenerstellungsdauer (Stunden):</label>
      <input type="number" id="erstellungsdauer" name="erstellungsdauer" required>

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
        schaedenhoehe: document.getElementById('schaedenhoehe').value,
        ort: document.getElementById('ort').value,
        begutachtungsdauer: document.getElementById('begutachtungsdauer').value,
        erstellungsdauer: document.getElementById('erstellungsdauer').value,
      };

      const bueroLat = 52.2801732; // Aktualisierter Breitengrad Ihres Büros
      const bueroLon = 10.4958380; // Aktualisierter Längengrad Ihres Büros

      // Geocoding des Ortes der Begutachtung
      geocodeAdresseNominatim(daten.ort, function(koordinatenZiel) {
        const zielLon = koordinatenZiel[0];
        const zielLat = koordinatenZiel[1];

        // Entfernung berechnen
        const entfernungInKm = berechneEntfernungHaversine(
          bueroLat,
          bueroLon,
          zielLat,
          zielLon
        );
        daten.strecke = entfernungInKm;

        // Berechnung durchführen
        const ergebnis = berechneBegutachtungskosten(daten);

        // Ergebnis anzeigen
        zeigeErgebnisAn(daten, ergebnis);
      });
    });
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

    const kostenAnfahrtspauschale = 0.8 * strecke;
    const kostenAnfahrt = (strecke / 100) * 85;
    const kostenErstellung = erstellungsdauer * 85;
    const kostenBegutachtung = begutachtungsdauer * 105;

    const gesamtKosten = kostenAnfahrtspauschale + kostenAnfahrt + kostenErstellung + kostenBegutachtung;

    return {
      kostenAnfahrtspauschale: kostenAnfahrtspauschale.toFixed(2),
      kostenAnfahrt: kostenAnfahrt.toFixed(2),
      kostenErstellung: kostenErstellung.toFixed(2),
      kostenBegutachtung: kostenBegutachtung.toFixed(2),
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
      <p><strong>Berechnete Anfahrtsstrecke:</strong> ${daten.strecke.toFixed(2)} km</p>
      <p><strong>Begutachtungsdauer:</strong> ${daten.begutachtungsdauer} Stunden</p>
      <p><strong>Gutachtenerstellungsdauer:</strong> ${daten.erstellungsdauer} Stunden</p>
      <hr>
      <p><strong>Kosten Anfahrtspauschale:</strong> ${ergebnis.kostenAnfahrtspauschale} €</p>
      <p><strong>Kosten Anfahrt:</strong> ${ergebnis.kostenAnfahrt} €</p>
      <p><strong>Kosten Gutachtenerstellung:</strong> ${ergebnis.kostenErstellung} €</p>
      <p><strong>Kosten Begutachtung:</strong> ${ergebnis.kostenBegutachtung} €</p>
      <hr>
      <h3>Gesamtkosten: ${ergebnis.gesamtKosten} €</h3>
    `;
  }

  // Initialisierung des Widgets
  initialisiereSchadensrechner();
})();

