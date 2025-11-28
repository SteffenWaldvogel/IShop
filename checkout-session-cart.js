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

let shippingMethods = [];
let shippingCostMap = {};

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
                price: price
            });
        });
        renderCheckoutItems();
    }

    shippingCostElement.textContent = '0.00';
    grandTotalElement.textContent = cartSubtotal.toFixed(2);
}

async function loadShippingMethods() {
    try {
        const res = await fetch('http://localhost:3000/api/shipping-methods');
        if (!res.ok) {
            throw new Error('Fehler beim Laden der Versandarten');
        }
        const data = await res.json();
        shippingMethods = data;

        shippingCostMap = {};
        shippingMethods.forEach(method => {
            if (method.code) {
                shippingCostMap[method.code] = parseFloat(method.cost);
            }
        });

        console.log('Versandarten geladen:', shippingMethods);

        updateTotalsWithShipping();
    } catch (err) {
        console.error('Fehler in loadShippingMethods:', err);
    }
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

function getSelectedShippingCost() {
    const selected = document.querySelector('input[name="shippingOption"]:checked');
    if (!selected) return 0;

    const code = selected.value;
    if (!shippingCostMap || shippingCostMap[code] == null) {
        return 0;
    }

    return shippingCostMap[code];
}

function updateTotalsWithShipping() {
    const shippingCostElement = document.getElementById('checkout-shipping-cost');
    const grandTotalElement = document.getElementById('checkout-grand-total');

    const shippingCost = getSelectedShippingCost();
    const total = cartSubtotal + shippingCost;

    shippingCostElement.textContent = shippingCost.toFixed(2);
    grandTotalElement.textContent = total.toFixed(2);
}
