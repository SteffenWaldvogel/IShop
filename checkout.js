let currentOrderData = null;
let currentGrandTotal = 0;
let paypalButtonsInitialized = false;

function setupPayPalButtons() {
    if (paypalButtonsInitialized) {
        return;
    }
    if (typeof paypal === 'undefined') {
        console.error('PayPal SDK wurde nicht geladen.');
        return;
    }

    paypalButtonsInitialized = true;

    paypal.Buttons({
        createOrder: function (data, actions) {
            return fetch('http://localhost:3000/api/paypal/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: currentGrandTotal })
            })
                .then(res => res.json())
                .then(data => {
                    if (!data.orderId) {
                        throw new Error('Keine PayPal-Order-ID zurückgegeben');
                    }
                    console.log('PayPal-Order vom Server:', data.orderId);
                    return data.orderId;
                });
        },

        onApprove: function (data, actions) {
            console.log('PayPal onApprove, OrderID:', data.orderID);
            currentOrderData.paypalOrderId = data.orderID;

            return fetch('http://localhost:3000/api/paypal/capture-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId: data.orderID })
            })
                .then(res => res.json())
                .then(async captureData => {
                    console.log('Capture Response:', captureData);
                    if (captureData.status !== 'COMPLETED') {
                        alert('PayPal-Zahlung konnte nicht abgeschlossen werden.');
                        throw new Error('PayPal Status nicht COMPLETED');
                    }

                    const checkoutRes = await fetch('http://localhost:3000/api/checkout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(currentOrderData)
                    });
                    const checkoutData = await checkoutRes.json();

                    console.log('Antwort vom Backend (Checkout):', checkoutData);

                    const params = new URLSearchParams({
                        orderId: checkoutData.orderId,
                        total: currentGrandTotal.toFixed(2)
                    });
                    window.location.href = `order-confirmation.html?${params.toString()}`;
                })
                .catch(err => {
                    console.error('Fehler im PayPal-Flow:', err);
                    alert('Ein Fehler ist bei der PayPal-Zahlung aufgetreten.');
                });
        }
    }).render('#paypal-button-container');
}

document.addEventListener('DOMContentLoaded', () => {
    loadCartForCheckout();
    loadShippingMethods();

    const billingSameCheckbox = document.getElementById('billing-same');
    const billingAddressSection = document.getElementById('billing-address-section');

    const placeOrderBtn = document.getElementById('place-order-btn');
    const paypalContainer = document.getElementById('paypal-button-container');

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

    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'paypal' && radio.checked) {
                paypalContainer.style.display = 'none';
                placeOrderBtn.style.display = 'inline-block';
            } else if (radio.checked) {
                paypalContainer.style.display = 'none';
                placeOrderBtn.style.display = 'inline-block';
            }
        });
    });

    const checkoutForm = document.querySelector('form');
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const phoneLocal = document.getElementById('phone-local').value.trim();
        const phone = '+49' + phoneLocal.replace(/\s|-/g, '');

        if (!validateAddresses()) {
            return;
        }

        if (cartSubtotal <= 0) { // kommt aus checkout-session-cart.js
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

        const shippingCost = getSelectedShippingCost(); // aus session-cart
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

        if (selectedPayment.value === 'paypal') {
            currentGrandTotal = grandTotal;
            currentOrderData = orderData;

            placeOrderBtn.style.display = 'none';
            paypalContainer.style.display = 'block';

            setupPayPalButtons();
            return;
        }

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
                const params = new URLSearchParams({
                    orderId: data.orderId,
                    total: grandTotal.toFixed(2)
                });
                window.location.href = `order-confirmation.html?${params.toString()}`;
            });
    });
});
