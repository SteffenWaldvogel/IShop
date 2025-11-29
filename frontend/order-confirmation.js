const params = new URLSearchParams(window.location.search);

const orderId = params.get('orderId');
const total = params.get('total');

const orderIdElement = document.getElementById('order-id');
const totalElement = document.getElementById('order-total');

if (orderIdElement) {
    orderIdElement.textContent = orderId || 'unbekannt';
}

if (totalElement) {
    if (total) {
        const totalNumber = parseFloat(total);
        totalElement.textContent = isNaN(totalNumber)
            ? total + ' €'
            : totalNumber.toFixed(2) + ' €';
    } else {
        totalElement.textContent = '-';
    }
}

console.log('Order-ID aus URL:', orderId);
console.log('Total aus URL:', total);

if (orderId) {
    fetch(`http://localhost:3000/api/orders/${orderId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Netzwerkantwort war nicht ok');
            }
            return res.json();
        })
        .then(order => {
            console.log('Bestelldaten:', order);

            const statusElement = document.getElementById('order-status');
            if (statusElement) {
                statusElement.textContent = order.status || 'Unbekannt';
            }
            const trackingElement = document.getElementById('order-tracking');
            if (trackingElement) {
                trackingElement.textContent = order.trackingNumber || 'Noch nicht verfügbar';
            }

            const itemsContainer = document.getElementById('order-items');
            if (itemsContainer) {
                itemsContainer.innerHTML = '';

                if (!order.items || order.items.length === 0) {
                    itemsContainer.textContent = 'Keine Artikel gefunden.';
                } else {
                    order.items.forEach(item => {
                        const row = document.createElement('div');
                        row.className = 'order-item-row';
                        row.innerHTML = `
                            <span class="item-name">${item.productname}</span>
                            <span class="item-quantity">Menge: ${item.quantity}</span>
                            <span class="item-price">Einzelpreis: ${item.price.toFixed(2)} €</span>
                            <span class="item-total">Gesamt: ${(item.price * item.quantity).toFixed(2)} €</span>
                        `;
                        itemsContainer.appendChild(row);
                    });
                }
            }

            const shippingContainer = document.getElementById('shipping-address');
            const billingContainer = document.getElementById('billing-address');

            function renderAddress(container, address) {
                if (!container) return;
                container.innerHTML = '';

                if (!address) {
                    container.textContent = 'Keine Adresse vorhanden.';
                    return;
                }

                container.innerHTML = `
                    <p>${address.firstName} ${address.lastName}</p>
                    <p>${address.street} ${address.houseNumber}</p>
                    <p>${address.zip} ${address.city}</p>
                    <p>${address.country}</p>
                `;
            }

            renderAddress(shippingContainer, order.shippingAddress);
            renderAddress(billingContainer, order.billingAddress);

            if (order.shippingAddress) {
                showMapForAddress(order.shippingAddress);
            }
        })
        .catch(err => {
            console.error('Fehler beim Abrufen der Bestelldaten:', err);
        });
}

function showMapForAddress(address) {
    const mapElement = document.getElementById('order-map');
    if (!mapElement) {
        console.warn('Kein Map-Container mit ID "order-map" gefunden.');
        return;
    }

    const query = `${address.street} ${address.houseNumber}, ${address.zip} ${address.city}, ${address.country}`;
    console.log('Geocode-Adresse:', query);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

    fetch(url, {
        headers: {
            'Accept-Language': 'de'
        }
    })
        .then(res => res.json())
        .then(results => {
            if (!results || results.length === 0) {
                console.warn('Keine Geocoding-Ergebnisse für Adresse:', query);
                mapElement.textContent = 'Karte konnte für diese Adresse nicht geladen werden.';
                return;
            }

            const { lat, lon, display_name } = results[0];
            const latNum = parseFloat(lat);
            const lonNum = parseFloat(lon);

            const map = L.map('order-map').setView([latNum, lonNum], 16);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap-Mitwirkende'
            }).addTo(map);

            L.marker([latNum, lonNum])
                .addTo(map)
                .bindPopup(display_name || 'Lieferadresse')
                .openPopup();
        })
        .catch(err => {
            console.error('Fehler beim Geocoding / Kartenaufbau:', err);
            mapElement.textContent = 'Karte konnte nicht geladen werden.';
        });
}
