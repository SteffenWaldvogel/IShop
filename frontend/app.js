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

function loadProductsFromApi() {
  fetch('http://localhost:3000/api/products').then(response => response.json()).then(data => {
    console.log(data);
    products = data.map(product => ({
      product_id: product.product_id,
      productname: product.productname,
      description: product.description,
      price: parseFloat(product.price),
      quanity: product.quantity,
      picturelink: product.picturelink
    }));
    console.log('Products loaded:', products);
    renderProducts();
    restoreCartFromRedis();
  });
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

  cartCountElement.innerText = cartCount;
  cartTotalElement.textContent = cartTotal.toFixed(2);
  renderCartItems();

  console.log('Warenkorb aus Redis geladen:', data);
}

  let products = [];

  let cartItems = [];
  let cartTotal = 0.00;
  let cartCount = 0;

  const cartTotalElement = document.getElementById('cart-total');
  const cartCountElement = document.getElementById('cart-count');
  const productListElement = document.getElementById('product-list');

  function addToCart(product) {
    cartCount++;
    cartCountElement.innerText = cartCount;

    cartTotal += product.price;
    cartTotalElement.textContent = cartTotal.toFixed(2);

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

  function renderProducts() {
    productListElement.innerHTML = '';

    products.forEach(product => {
      const article = document.createElement('article');
      article.dataset.productName = product.productname;
      article.dataset.productPrice = product.price;

      const title = document.createElement('h3');
      title.textContent = product.productname;

      const desc = document.createElement('p');
      desc.textContent = product.description;

      const price = document.createElement('p');
      price.textContent = `Price: ${product.price}€`;

      const button = document.createElement('button');
      button.textContent = 'Add to Cart';
      button.className = 'add-to-cart';

      const image = document.createElement('img');
      image.src = '../' + product.picturelink;
      image.alt = product.productname;
      image.className = 'product-image';
      article.appendChild(image);

      button.addEventListener('click', () => {
        addToCart(product);
      });

      article.appendChild(title);
      article.appendChild(desc);
      article.appendChild(price);
      article.appendChild(button);
      article.appendChild(image);

      productListElement.appendChild(article);
    });
  }

  loadProductsFromApi();