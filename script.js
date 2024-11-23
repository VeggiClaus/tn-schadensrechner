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
  
        <label for="ort">Ort der Begutachtung:</label>
        <input type="text" id="ort" name="ort" required>
  
        <label for="strecke">Voraussichtliche Anfahrtsstrecke (km):</label>
        <input type="number" id="strecke" name="strecke" required>
  
        <label for="begutachtungsdauer">Begutachtungsdauer (Stunden):</label>
        <input type="number" id="begutachtungsdauer" name="begutachtungsdauer" required>
  
        <label for="erstellungsdauer">Gutachtenerstellungsdauer (Stunden):</label>
        <input type="number" id="erstellungsdauer" name="erstellungsdauer" required>
  
        <button type="submit">Berechnen</button>
      </form>
      <div id="ergebnis"></div>
    `;
  
    // Funktion zum Einfügen des Formulars in den Container
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
  
        // Sammeln der Formulardaten
        const daten = {
          name: document.getElementById('name').value,
          gegenstand: document.getElementById('gegenstand').value,
          schaedenhoehe: document.getElementById('schaedenhoehe').value,
          ort: document.getElementById('ort').value,
          strecke: document.getElementById('strecke').value,
          begutachtungsdauer: document.getElementById('begutachtungsdauer').value,
          erstellungsdauer: document.getElementById('erstellungsdauer').value
        };
  
        // Berechnung durchführen
        const ergebnis = berechneBegutachtungskosten(daten);
  
        // Ergebnis anzeigen
        document.getElementById('ergebnis').innerHTML = `
          <h2>Ergebnis</h2>
          <p><strong>Name:</strong> ${daten.name}</p>
          <p><strong>Schadensgegenstand:</strong> ${daten.gegenstand}</p>
          <p><strong>Voraussichtliche Schadenshöhe:</strong> ${daten.schaedenhoehe} €</p>
          <p><strong>Ort der Begutachtung:</strong> ${daten.ort}</p>
          <p><strong>Anfahrtsstrecke:</strong> ${daten.strecke} km</p>
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
      });
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
        gesamtKosten: gesamtKosten.toFixed(2)
      };
    }
  
    // Initialisierung des Widgets
    initialisiereSchadensrechner();
  })();
