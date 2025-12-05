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
console.log('Session ID:', sessionId);

let products = [];

let cartItems = [];
let cartTotal = 0.00;
let cartCount = 0;

const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');
const productListElement = document.getElementById('product-list');

const mainProductTitle = document.getElementById('main-product-title');
const mainProductImage = document.getElementById('main-product-image');
const detailTitle = document.getElementById('detail-title');
const detailPrice = document.getElementById('detail-price');
const detailId = document.getElementById('detail-id');
const detailStock = document.getElementById('detail-stock');
const detailDescription = document.getElementById('detail-description');

const qtyInput = document.getElementById('qty-input');
const qtyMinusBtn = document.getElementById('qty-minus');
const qtyPlusBtn = document.getElementById('qty-plus');
const addToCartMainBtn = document.getElementById('add-to-cart-btn');

let selectedProduct = null;

function loadProductsFromApi() {
  fetch('http://localhost:3000/api/products')
    .then(response => response.json())
    .then(data => {
      console.log(data);
      products = data.map(product => ({
        product_id: product.product_id,
        productname: product.productname,
        description: product.description,
        price: parseFloat(product.price),
        quantity: product.quantity,
        picturelink: product.picturelink
      }));
      console.log('Products loaded:', products);
      renderProducts();
      setDefaultMainProduct();
      restoreCartFromRedis();
    })
    .catch(err => console.error('Fehler beim Laden der Produkte:', err));
}

async function restoreCartFromRedis() {
  const response = await fetch(`http://localhost:3000/api/cart/${sessionId}`);
  const data = await response.json();

  cartItems = [];
  cartTotal = 0.00;
  cartCount = 0;

  data.items.forEach(item => {
    const product = products.find(p => p.product_id === item.product_id);
    if (!product) {
      return;
    }

    const lineTotal = item.quantity * product.price;

    cartItems.push({
      product_id: product.product_id,
      productname: product.productname,
      price: product.price,
      quantity: item.quantity
    });
    cartCount += item.quantity;
    cartTotal += lineTotal;
  });

  if (cartCountElement) {
    cartCountElement.innerText = cartCount;
  }
  if (cartTotalElement) {
    cartTotalElement.textContent = cartTotal.toFixed(2);
  }
  renderCartItems();

  console.log('Warenkorb aus Redis geladen:', data);
}

function addToCart(product) {
  cartCount++;
  if (cartCountElement) {
    cartCountElement.innerText = cartCount;
  }

  cartTotal += product.price;
  if (cartTotalElement) {
    cartTotalElement.textContent = cartTotal.toFixed(2);
  }

  const existingItem = cartItems.find(item => item.product_id === product.product_id);

  if (existingItem) {
    existingItem.quantity++;
    console.log(
      `Increased quantity: ${existingItem.productname} Menge: ${existingItem.quantity} - €${existingItem.price}`
    );
  } else {
    const newItem = {
      product_id: product.product_id,
      productname: product.productname,
      price: product.price,
      quantity: 1
    };
    cartItems.push(newItem);
    console.log(
      `Added to cart: ${newItem.productname} (x${newItem.quantity}) - €${newItem.price}`
    );
  }

  console.log('Cart Items:', cartItems);

  renderCartItems();
}

function renderCartItems() {
  saveCartToRedis();
}

function saveCartToRedis() {
  const itemsForRedis = cartItems.map(item => ({
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
      console.log('Warenkorb in Redis gespeichert:', data);
    })
    .catch(error => {
      console.error('Fehler beim Speichern des Warenkorbs in Redis:', error);
    });
}

function updateMainProductPanel(product) {
  if (!product) return;
  selectedProduct = product;

  if (mainProductTitle) mainProductTitle.textContent = product.productname;
  if (detailTitle) detailTitle.textContent = product.productname;
  if (detailPrice) detailPrice.textContent = product.price.toFixed(2) + ' €';
  if (detailId) detailId.textContent = product.product_id;
  if (detailStock) detailStock.textContent = product.quantity ?? '–';
  if (detailDescription) {
    detailDescription.textContent = product.description || '';
  }

  if (mainProductImage) {
    mainProductImage.innerHTML = '';
    if (product.picturelink) {
      const img = document.createElement('img');
      img.src = '../' + product.picturelink;
      img.alt = product.productname;
      img.className = 'main-product-img';
      mainProductImage.appendChild(img);
    } else {
      mainProductImage.style.backgroundImage = '';
    }
  }
}

function setDefaultMainProduct() {
  if (!products || products.length === 0) return;

  const defaultProduct =
    products.find(p => p.product_id === 1) || products[0];

  updateMainProductPanel(defaultProduct);
}

function renderProducts() {
  if (!productListElement) return;

  productListElement.innerHTML = '';

  products.forEach(product => {
    const article = document.createElement('article');
    article.dataset.productId = product.product_id;

    const image = document.createElement('img');
    image.src = '../' + product.picturelink;
    image.alt = product.productname;
    image.className = 'product-image';

    const title = document.createElement('h3');
    title.textContent = product.productname;

    article.addEventListener('click', () => {
      updateMainProductPanel(product);
    });

    article.appendChild(image);
    article.appendChild(title);

    productListElement.appendChild(article);
  });
}

if (qtyMinusBtn && qtyPlusBtn && qtyInput) {
  qtyMinusBtn.addEventListener('click', () => {
    const current = parseInt(qtyInput.value || '1', 10);
    qtyInput.value = Math.max(1, current - 1);
  });

  qtyPlusBtn.addEventListener('click', () => {
    const current = parseInt(qtyInput.value || '1', 10);
    qtyInput.value = current + 1;
  });
}

if (addToCartMainBtn && qtyInput) {
  addToCartMainBtn.addEventListener('click', () => {
    if (!selectedProduct) return;

    const qty = parseInt(qtyInput.value || '1', 10) || 1;

    for (let i = 0; i < qty; i++) {
      addToCart(selectedProduct);
    }
  });
}

loadProductsFromApi();
