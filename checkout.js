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
                <span class="item-name">${item.name}</span>
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

    const shippingOptions = document.querySelectorAll('input[name="shippingOption"]');
    shippingOptions.forEach(option => {
        option.addEventListener('change', () => {
            updateTotalsWithShipping();
        });
    });

    const checkoutForm = document.querySelector('form');
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

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

        alert(`Bestellung erfolgreich! Gesamtbetrag: €${grandTotal.toFixed(2)}`);

        localStorage.removeItem('shoppingCart');
        cartSubtotal = 0;

        document.getElementById('checkout-cart-items').innerHTML = '<p>Dein Warenkorb ist leer, schäm dich.</p>';
        document.getElementById('checkout-cart-total').textContent = '0.00';
        document.getElementById('checkout-shipping-cost').textContent = '0.00';
        document.getElementById('checkout-grand-total').textContent = '0.00';

    });
});
