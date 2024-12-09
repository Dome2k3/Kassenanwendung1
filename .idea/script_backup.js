let total = 0;
let itemCount = 1;
let receiptCount = 1; // Eindeutige Bon-Nummer
let history = []; // Speichert alle Bons

function addItem(itemName, itemPrice) {
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
    const receiptList = document.querySelectorAll('#receipt-list li');
    const receiptItems = Array.from(receiptList).map(item => item.textContent).join(', ');

    if (receiptItems) {
        const timestamp = new Date().toLocaleString();
        const bonDetails = {
            id: receiptCount,
            timestamp: timestamp,
            items: receiptItems,
            total: total.toFixed(2)
        };

        history.push(bonDetails);
        console.log('Bon abgeschlossen:', bonDetails);

        // Historie aktualisieren und Bon zurücksetzen
        updateHistory();
        resetReceipt();

        receiptCount++; // Bon-Nummer erhöhen
    }
}

function updateHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = ''; // Bestehenden Inhalt löschen

    history.forEach((receipt) => {
        const historyItem = document.createElement('li');
        historyItem.innerHTML = `
            <strong>Bon Nr. ${receipt.id}</strong> - ${receipt.timestamp}<br>
            Artikel:<br>${receipt.items.replace(/,/g, '<br>')}<br>
            <strong>Summe:</strong> €${Number(receipt.total).toFixed(2)}
        `;
        historyList.appendChild(historyItem);
    });
}

function printReceipt() {
    // Erstelle eine neue PDF-Instanz
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Füge den Inhalt des Bons zur PDF hinzu
    const receiptList = document.getElementById('receipt-list');
    const receiptContent = receiptList.innerText; // Nur Text, keine HTML-Tags
    const totalAmount = document.getElementById('total').textContent;

    doc.text('BON', 10, 10);
    doc.text(`Datum: ${new Date().toLocaleString()}`, 10, 20);
    doc.text(receiptContent, 10, 30);
    doc.text(`Summe: €${totalAmount}`, 10, 50);

    // PDF speichern und im Downloads-Ordner speichern
    doc.save(`bon_${receiptCount}.pdf`);
}
