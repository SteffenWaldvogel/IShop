function getSessionId() {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'ishop_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

const sessionId = getSessionId();
console.log('Session ID (Checkout):', sessionId);

let cartSubtotal = 0; // Zwischensumme

function loadCartForCheckout() {
    const cartItemsContainer = document.getElementById('checkout-cart-items');
    const cartTotalElement = document.getElementById('checkout-cart-total');
    const shippingCostElement = document.getElementById('checkout-shipping-cost');
    const grandTotalElement = document.getElementById('checkout-grand-total');

    const cartDataString = localStorage.getItem('shoppingCart');
    let cartData = null;

    if (cartDataString) {
        cartData = JSON.parse(cartDataString);
    }

    if (cartData && cartData.items && cartData.items.length > 0) {
        cartItemsContainer.innerHTML = '';
        cartData.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'checkout-cart-item';
            itemElement.innerHTML = `
                <span class="item-name">${item.productname}</span>
                <span class="item-quantity">x${item.quantity}</span>
                <span class="item-price">€${(item.price * item.quantity).toFixed(2)}</span>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        cartSubtotal = cartData.total || 0;
        cartTotalElement.textContent = cartSubtotal.toFixed(2);
    } else {
        cartItemsContainer.innerHTML = '<p>Dein Warenkorb ist leer, schäm dich.</p>';
        cartSubtotal = 0;
        cartTotalElement.textContent = '0.00';
    }

    shippingCostElement.textContent = '0.00';
    grandTotalElement.textContent = cartSubtotal.toFixed(2);
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

        const cartDataString = localStorage.getItem('shoppingCart');
        const cartData = cartDataString ? JSON.parse(cartDataString) : null;

        const orderData = {
            customer: {
                email,
                phone
            },
            items: cartData ? cartData.items : [],
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

                localStorage.removeItem('shoppingCart');
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
