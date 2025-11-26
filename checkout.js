function getSessionId() {
  const cookieName = 'sessionId=';
  const cookies = document.cookie.split(';').map(c => c.trim());
  const existing = cookies.find(c => c.startsWith(cookieName));

  if (existing) {
    return existing.substring(cookieName.length);
  }

  const newSessionId =
    'ishop_' + Math.random().toString(36).substr(2) + Date.now().toString(36);

  const maxAgeSeconds = 3600;
  document.cookie = `${cookieName}${newSessionId}; path=/; max-age=${maxAgeSeconds}`;

  return newSessionId;
}

const sessionId = getSessionId();
console.log('Session ID (Checkout):', sessionId);

let cartSubtotal = 0; // Zwischensumme
let checkoutItems = []; 
let productMap = {};

async function loadCartForCheckout() {
    const cartItemsContainer = document.getElementById('checkout-cart-items');
    const cartTotalElement = document.getElementById('checkout-cart-total');
    const shippingCostElement = document.getElementById('checkout-shipping-cost');
    const grandTotalElement = document.getElementById('checkout-grand-total');

    const cartResponse = await fetch(`http://localhost:3000/api/cart/${sessionId}`);
    const cartData = await cartResponse.json();

    const productsResponse = await fetch('http://localhost:3000/api/products');
    const products = await productsResponse.json();

    productMap = {};
    products.forEach(product => {
        productMap[product.product_id] = product;
    });

    if (!cartData.items || cartData.items.length === 0) {
        cartItemsContainer.innerHTML = '<p>Dein Warenkorb ist leer, schäm dich.</p>';
        cartSubtotal = 0;
        cartTotalElement.textContent = '0.00';
    } else {
        checkoutItems = [];
        cartSubtotal = 0;

        cartData.items.forEach(item => {
            const product = productMap[item.product_id];
            if (!product) {
                return;
            }
            const price = parseFloat(product.price);
            checkoutItems.push({
                product_id: product.product_id,
                quantity: item.quantity,
                price: price,
            });
        });
        renderCheckoutItems();
    }
    
    shippingCostElement.textContent = '0.00';
    grandTotalElement.textContent = cartSubtotal.toFixed(2);
}

function renderCheckoutItems() {
    const cartItemsContainer = document.getElementById('checkout-cart-items');
    const cartTotalElement = document.getElementById('checkout-cart-total');
    const shippingCostElement = document.getElementById('checkout-shipping-cost');
    const grandTotalElement = document.getElementById('checkout-grand-total');

    cartItemsContainer.innerHTML = '';
    cartSubtotal = 0;

    checkoutItems.forEach(item => {
        const product = productMap[item.product_id];
        if (!product) return;

        const lineTotal = item.quantity * item.price;
        cartSubtotal += lineTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'checkout-cart-item';
        itemElement.innerHTML = `
            <span class="item-name">${product.productname}</span>
            <div class="item-controls">
                <button class="qty-minus">-</button>
                <span class="item-quantity">Menge: ${item.quantity}</span>
                <button class="qty-plus">+</button>
                <span class="item-price">€${lineTotal.toFixed(2)}</span>
                <button class="item-remove">🗑️</button>
            </div>
        `;

        const minusBtn = itemElement.querySelector('.qty-minus');
        const plusBtn = itemElement.querySelector('.qty-plus');
        const removeBtn = itemElement.querySelector('.item-remove');

        plusBtn.addEventListener('click', () => {
            item.quantity += 1;
            renderCheckoutItems();
            saveCheckoutCart();
        });

        minusBtn.addEventListener('click', () => {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                checkoutItems = checkoutItems.filter(ci => ci.product_id !== item.product_id);
            }
            renderCheckoutItems();
            saveCheckoutCart();
        });

        removeBtn.addEventListener('click', () => {
            checkoutItems = checkoutItems.filter(ci => ci.product_id !== item.product_id);
            renderCheckoutItems();
            saveCheckoutCart();
        });

        cartItemsContainer.appendChild(itemElement);
    });

    cartTotalElement.textContent = cartSubtotal.toFixed(2);

    const shippingCost = getSelectedShippingCost();   
    const grandTotal = cartSubtotal + shippingCost;

    shippingCostElement.textContent = shippingCost.toFixed(2);
    grandTotalElement.textContent = grandTotal.toFixed(2);
}

function saveCheckoutCart() {
    const itemsForRedis = checkoutItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
    }));

    fetch(`http://localhost:3000/api/cart/${sessionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: itemsForRedis })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Checkout-Warenkorb in Redis gespeichert:', data);
    })
    .catch(error => {
        console.error('Fehler beim Speichern des Checkout-Warenkorbs in Redis:', error);
    });
}


function validateAddresses() {
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone-local').value.trim();

    const shipping = {
        firstName: document.getElementById('first-name').value.trim(),
        lastName: document.getElementById('last-name').value.trim(),
        street: document.getElementById('street').value.trim(),
        houseNumber: document.getElementById('house-number').value.trim(),
        zip: document.getElementById('zip').value.trim(),
        city: document.getElementById('city').value.trim(),
        country: document.getElementById('country').value.trim()
    };

    const billingSame = document.getElementById('billing-same').checked;

    const errors = [];

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9\s\-]{6,15}$/;

    if (!emailRegex.test(email)) {
        errors.push('Bitte gib eine gültige E-Mail-Adresse ein.');
    }

    if (!phoneRegex.test(phone)) {
        errors.push('Bitte gib eine gültige Telefonnummer ein.');
    }
    if (shipping.firstName.length < 2) {
        errors.push('Der Vorname muss mindestens 2 Zeichen lang sein.');
    }
    if (shipping.lastName.length < 2) {
        errors.push('Der Nachname muss mindestens 2 Zeichen lang sein.');
    }
    if (shipping.street.length < 2) {
        errors.push('Die Straße muss mindestens 2 Zeichen lang sein.');
    }
    if (!/^[0-9]{1,4}[a-zA-Z]?$/.test(shipping.houseNumber)) {
        errors.push('Die Hausnummer ist ungültig.');
    }
    if (shipping.city.length < 2) {
        errors.push('Die Stadt muss mindestens 2 Zeichen lang sein.');
    }
    if (!/^[0-9]{5}$/.test(shipping.zip)) {
        errors.push('Die Postleitzahl muss genau 5 Ziffern haben.');
    }
    if (shipping.country.length < 3) {
        errors.push('Das Land muss mindestens 3 Zeichen lang sein.');
    }

    if (!billingSame) {
        const billing = {
            firstName: document.getElementById('billing-first-name').value.trim(),
            lastName: document.getElementById('billing-last-name').value.trim(),
            street: document.getElementById('billing-street').value.trim(),
            houseNumber: document.getElementById('billing-house-number').value.trim(),
            zip: document.getElementById('billing-zip').value.trim(),
            city: document.getElementById('billing-city').value.trim(),
            country: document.getElementById('billing-country').value.trim()
        };
        if (billing.firstName.length < 2) {
            errors.push('Der Vorname muss mindestens 2 Zeichen lang sein.');
        }
        if (billing.lastName.length < 2) {
            errors.push('Der Nachname muss mindestens 2 Zeichen lang sein.');
        }
        if (billing.street.length < 2) {
            errors.push('Die Straße muss mindestens 2 Zeichen lang sein.');
        }
        if (!/^[0-9]{1,4}[a-zA-Z]?$/.test(billing.houseNumber)) {
            errors.push('Die Hausnummer ist ungültig.');
        }
        if (billing.city.length < 2) {
            errors.push('Die Stadt muss mindestens 2 Zeichen lang sein.');
        }
        if (!/^[0-9]{5}$/.test(billing.zip)) {
            errors.push('Die Postleitzahl muss genau 5 Ziffern haben.');
        }
        if (billing.country.length < 3) {
            errors.push('Das Land muss mindestens 3 Zeichen lang sein.');
        }
    }
    if (errors.length > 0) {
        alert(errors.join('\n'));
        return false;
    }
    return true;
}

function getSelectedShippingCost() {
    const selected = document.querySelector('input[name="shippingOption"]:checked');
    if (!selected) return 0;

    switch (selected.value) {
        case 'standard':
            return 5.00;
        case 'express':
            return 15.00;
        case 'premium':
            return 70.00;
        default:
            return 0;
    }
}

function updateTotalsWithShipping() {
    const shippingCostElement = document.getElementById('checkout-shipping-cost');
    const grandTotalElement = document.getElementById('checkout-grand-total');

    const shippingCost = getSelectedShippingCost();
    const total = cartSubtotal + shippingCost;

    shippingCostElement.textContent = shippingCost.toFixed(2);
    grandTotalElement.textContent = total.toFixed(2);
}

document.addEventListener('DOMContentLoaded', () => {
    loadCartForCheckout();

    const billingSameCheckbox = document.getElementById('billing-same');
    const billingAddressSection = document.getElementById('billing-address-section');

    billingSameCheckbox.addEventListener('change', () => {
        if (billingSameCheckbox.checked) {
            billingAddressSection.style.display = 'none';
        } else {
            billingAddressSection.style.display = 'block';
        }
    });

    const shippingOptions = document.querySelectorAll('input[name="shippingOption"]');
    shippingOptions.forEach(option => {
        option.addEventListener('change', () => {
            updateTotalsWithShipping();
        });
    });

    const checkoutForm = document.querySelector('form');
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const phoneLocal = document.getElementById('phone-local').value.trim();
        const phone = '+49' + phoneLocal.replace(/\s|-/g, '');

        if (!validateAddresses()) {
            return;
        }

        if (cartSubtotal <= 0) {
            alert('Dein Warenkorb ist leer. Bitte füge Artikel hinzu, bevor du bestellst.');
            return;
        }

        const selectedShipping = document.querySelector('input[name="shippingOption"]:checked');
        if (!selectedShipping) {
            alert('Bitte wähle eine Versandoption aus.');
            return;
        }

        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedPayment) {
            alert('Bitte wähle eine Zahlungsmethode aus.');
            return;
        }

        const shippingCost = getSelectedShippingCost();
        const grandTotal = cartSubtotal + shippingCost;
        const billingSame = document.getElementById('billing-same').checked;
        const shippingAddress = {
            firstName: document.getElementById('first-name').value.trim(),
            lastName: document.getElementById('last-name').value.trim(),
            street: document.getElementById('street').value.trim(),
            houseNumber: document.getElementById('house-number').value.trim(),
            zip: document.getElementById('zip').value.trim(),
            city: document.getElementById('city').value.trim(),
            country: document.getElementById('country').value.trim()
        };

        let billingAddress = null;
        if (billingSame) {
            billingAddress = { ...shippingAddress };
        } else {
            billingAddress = {
                firstName: document.getElementById('billing-first-name').value.trim(),
                lastName: document.getElementById('billing-last-name').value.trim(),
                street: document.getElementById('billing-street').value.trim(),
                houseNumber: document.getElementById('billing-house-number').value.trim(),
                zip: document.getElementById('billing-zip').value.trim(),
                city: document.getElementById('billing-city').value.trim(),
                country: document.getElementById('billing-country').value.trim()
            };
        }

        const orderData = {
            sessionId,
            customer: {
                email,
                phone
            },
            totals: {
                subtotal: cartSubtotal,
                shipping: shippingCost,
                grandTotal: grandTotal
            },
            shippingOption: selectedShipping.value,
            paymentMethod: selectedPayment.value,
            shippingAddress,
            billingAddress,
            billingSame
        };

        fetch('http://localhost:3000/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Antwort vom Backend:', data);
                alert(`Bestellung erfolgreich! Bestellnummer: ${data.orderId}, Gesamtbetrag: €${grandTotal.toFixed(2)}`);

                cartSubtotal = 0;

                document.getElementById('checkout-cart-items').innerHTML = '<p>Dein Warenkorb ist leer, schäm dich.</p>';
                document.getElementById('checkout-cart-total').textContent = '0.00';
                document.getElementById('checkout-shipping-cost').textContent = '0.00';
                document.getElementById('checkout-grand-total').textContent = '0.00';
            })
            .catch(err => {
                console.error('Fehler beim Checkout-Request:', err);
                alert('Beim Absenden der Bestellung ist ein Fehler aufgetreten.');
            });
    });
});
