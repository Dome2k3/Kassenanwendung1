let total = 0;
let itemCount = 1;
let receiptCount = 1; // Eindeutige Bon-Nummer
let history = []; // Speichert alle Bons

// Funktion für normale Artikel
function addItem(itemName, itemPrice) {
    // Gleiche Logik wie bisher
    const receiptList = document.getElementById('receipt-list');
    const newItem = document.createElement('li');
    newItem.textContent = `${itemCount}. ${itemName} - €${itemPrice.toFixed(2)}`;
    receiptList.appendChild(newItem);

    total += itemPrice;
    document.getElementById('total').textContent = total.toFixed(2);
    itemCount++;
}


function resetReceipt() {
    const receiptList = document.getElementById('receipt-list');
    receiptList.innerHTML = ''; // Inhalt des aktuellen Bons löschen

    total = 0;
    document.getElementById('total').textContent = total.toFixed(2);
    itemCount = 1; // Artikelnummer zurücksetzen
    // Keine Historie aktualisieren
}

function finalizeBon() {
    const receiptList = document.querySelector('#receipt-list');
    const receiptItems = Array.from(receiptList.children).map(item => item.textContent).join('\n');
    const timestamp = new Date().toLocaleString();

    if (receiptItems) {
        const bonDetails = {
            id: receiptCount,
            timestamp: timestamp,
            items: receiptItems,
            total: total.toFixed(2)
        };

        history.unshift(bonDetails);
        console.log('Bon abgeschlossen:', bonDetails);

        // Verkaufsdaten speichern
        recordSale(total, receiptItems.split('\n'));

        updateHistory();
        receiptCount++;
        // PDF-Druck nach Abschluss des Bons
        //printReceipt();
        resetReceipt();
    }
}


function printReceipt() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Kopfzeile und Datum hinzufügen
    doc.text('BON', 10, 10);
    doc.text(`Datum: ${new Date().toLocaleString()}`, 10, 20);

    // Den Inhalt der Liste extrahieren und überprüfen
    const receiptList = document.getElementById('receipt-list');
    if (receiptList) {
        const receiptItems = Array.from(receiptList.children).map(item => item.textContent).join('\n');
        console.log('Extrahierter Inhalt der Liste:', receiptItems);

        if (receiptItems) {
            // Inhalt der Gerichte zur PDF hinzufügen
            const yPosition = 30;
            doc.text(receiptItems, 10, yPosition);

            // Summe hinzufügen
            const totalAmount = document.getElementById('total').textContent;
            const sumPosition = yPosition + (receiptItems.split('\n').length * 10) + 10;
            doc.text(`Summe: €${totalAmount}`, 10, sumPosition);

            // PDF speichern und im Downloads-Ordner speichern
            doc.save(`bon_${receiptCount}.pdf`);
        } else {
            console.log('Die Liste ist leer oder die Elemente wurden nicht korrekt erfasst.');
        }
    } else {
        console.log('Die Liste mit der ID "receipt-list" wurde nicht gefunden.');
    }
}

function updateHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = ''; // Liste zurücksetzen

    history.forEach((receipt) => {
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');

        const details = document.createElement('div');
        details.innerHTML = `
            <p><strong>Datum:</strong> ${receipt.timestamp}</p>
            <p><strong>Artikel:</strong><br>${receipt.items.replaceAll(',', '<br>')}</p>
            <p><strong>Summe:</strong> €${receipt.total}</p>
        `;
        details.style.display = 'none'; // Versteckt die Details zunächst

        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Details anzeigen';
        toggleButton.onclick = () => {
            const isHidden = details.style.display === 'none';
            details.style.display = isHidden ? 'block' : 'none';
            toggleButton.textContent = isHidden ? 'Details verbergen' : 'Details anzeigen';
        };

        historyItem.innerHTML = `<h4>Bon Nr. ${receipt.id}</h4>`;
        historyItem.appendChild(toggleButton);
        historyItem.appendChild(details);

        historyList.appendChild(historyItem);
    });
}

// Array zur Speicherung der Verkaufsdaten
let salesData = []; // Beispiel: [{ timestamp: '2024-12-06T10:30:00', total: 17.00, items: ['Pizza', 'Pizza'] }, ...]

// Funktion, um Verkaufsdaten zu speichern
function recordSale(total, items) {
    const sale = {
        timestamp: new Date(),
        total: total,
        items: items
    };

    // Verkaufsdaten im localStorage speichern
    let salesData = JSON.parse(localStorage.getItem('salesData')) || [];
    salesData.push(sale);
    localStorage.setItem('salesData', JSON.stringify(salesData));
}

// Funktion zur Berechnung der Statistiken und Anzeige
function calculateStatistics() {
    let salesData = JSON.parse(localStorage.getItem('salesData')) || [];
    let totalSales = 0;
    let totalRevenue = 0;
    let itemCounts = {};
    const fifteenMinuteIntervals = [];

    salesData.forEach((sale) => {
        totalSales++;
        totalRevenue += sale.total;

        sale.items.forEach((item) => {
            itemCounts[item] = (itemCounts[item] || 0) + 1;
        });

        const intervalDuration = 15 * 60 * 1000;
        const intervalIndex = Math.floor(new Date(sale.timestamp).getTime() / intervalDuration);

        if (!fifteenMinuteIntervals[intervalIndex]) {
            fifteenMinuteIntervals[intervalIndex] = {
                startTime: new Date(intervalIndex * intervalDuration),
                totalSales: 0,
                totalRevenue: 0
            };
        }
        fifteenMinuteIntervals[intervalIndex].totalSales++;
        fifteenMinuteIntervals[intervalIndex].totalRevenue += sale.total;
    });

    displayStatistics(totalSales, totalRevenue, itemCounts, fifteenMinuteIntervals);
}


// Funktion zur Anzeige der Statistiken
function displayStatistics(totalSales, totalRevenue, itemCounts, fifteenMinuteIntervals) {
    const statsOutput = document.getElementById('statistics-output');
    statsOutput.innerHTML = `
        <p><strong>Gesamtanzahl der Verkäufe:</strong> ${totalSales}</p>
        <p><strong>Gesamtsumme der Verkäufe:</strong> €${totalRevenue.toFixed(2)}</p>
        <p><strong>Verkaufte Einheiten pro Artikel:</strong></p>
        <ul>
            ${Object.entries(itemCounts).map(([item, count]) => `<li>${item}: ${count}</li>`).join('')}
        </ul>
        <p><strong>Verkäufe alle 15 Minuten:</strong></p>
        <ul>
            ${fifteenMinuteIntervals.map((interval, index) => `
                <li>Zeitraum ${new Date(interval.startTime).toLocaleTimeString()}: ${interval.totalSales} Verkäufe, €${interval.totalRevenue.toFixed(2)}</li>
            `).join('')}
        </ul>
    `;
}

// Beispiel für einen Button-Klick, um zur Statistik-Seite zu navigieren
document.getElementById('view-statistics').onclick = function() {
    window.location.href = 'statistics.html';
};

// Beim Laden der Seite Statistik anzeigen
window.onload = function() {
    const salesData = JSON.parse(localStorage.getItem('salesData')) || [];
    if (salesData.length > 0) {
        calculateStatistics();
    } else {
        document.getElementById('statistics-output').innerHTML = '<p>Keine Verkaufsdaten vorhanden.</p>';
    }
};

function generatePDF(bon) {
    const doc = new jsPDF();
    doc.text(`Bon Nr. ${bon.receiptCount}`, 10, 10);
    doc.text(`Datum: ${bon.timestamp}`, 10, 20);
    doc.text(`Artikel:`, 10, 30);
    bon.items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item}`, 10, 40 + index * 10);
    });
    doc.text(`Summe: €${bon.total.toFixed(2)}`, 10, 70);
    doc.save(`Bon_${bon.receiptCount}.pdf`);
}
