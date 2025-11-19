function loadProductsFromApi() {
  fetch ('http://localhost:3000/api/products').then(response => response.json()).then(data => {console.log(data);
    products = data;
    renderProducts();
  });
}

let products = [];

let cartItems = [];
let cartTotal = 0.00;
let cartCount = 0;

const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');
const cartItemsElement = document.getElementById('cart-items');
const clearCartButton = document.getElementById('clear-cart');
const productListElement = document.getElementById('product-list');

function addToCart(product) {
  cartCount++;
  cartCountElement.innerText = cartCount;

  cartTotal += product.price;
  cartTotalElement.textContent = cartTotal.toFixed(2);

  const existingItem = cartItems.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity++;
    console.log(
      `Increased quantity: ${existingItem.name} Menge: ${existingItem.quantity} - €${existingItem.price}`
    );
  } else {
    const newItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    };
    cartItems.push(newItem);
    console.log(
      `Added to cart: ${newItem.name} (x${newItem.quantity}) - €${newItem.price}`
    );
  }

  console.log('Cart Items:', cartItems);

  renderCartItems();
}


function renderCartItems() {
  cartItemsElement.innerHTML = '';

  cartItems.forEach(item => {
    const li = document.createElement('li');

    const lineTotal = item.quantity * item.price;
    li.textContent = `${item.name} (Menge: ${item.quantity}) - €${lineTotal.toFixed(2)} `;

    const plusButton = document.createElement('button');
    plusButton.textContent = '+';
    plusButton.className = 'cart-plus-button';

    plusButton.addEventListener('click', () => {
      item.quantity += 1;
      cartCount += 1;
      cartTotal += item.price;

      cartCountElement.innerText = cartCount;
      cartTotalElement.textContent = cartTotal.toFixed(2);

      renderCartItems();
    });

    const minusButton = document.createElement('button');
    minusButton.textContent = '-';
    minusButton.className = 'cart-minus-button';

    minusButton.addEventListener('click', () => {
      if (item.quantity > 0) {
        item.quantity -= 1;
        cartCount -= 1;
        cartTotal -= item.price;

        if (item.quantity === 0) {
          cartItems = cartItems.filter(ci => ci.id !== item.id);
        }

        cartCountElement.innerText = cartCount;
        cartTotalElement.textContent = cartTotal.toFixed(2);

        renderCartItems();
      }
    });

    const removeButton = document.createElement('button');
    removeButton.textContent = '🗑️';
    removeButton.className = 'cart-remove-button';

    removeButton.addEventListener('click', () => {
      cartCount -= item.quantity;
      cartTotal -= item.price * item.quantity;
      cartItems = cartItems.filter(ci => ci.id !== item.id);

      cartCountElement.innerText = cartCount;
      cartTotalElement.textContent = cartTotal.toFixed(2);

      renderCartItems();
    });

    li.appendChild(plusButton);
    li.appendChild(minusButton);
    li.appendChild(removeButton);

    cartItemsElement.appendChild(li);
  });
}



function renderProducts() {
  productListElement.innerHTML = '';

  products.forEach(product => {
    const article = document.createElement('article');
    article.dataset.productName = product.name;
    article.dataset.productPrice = product.price;

    const title = document.createElement('h3');
    title.textContent = product.name;

    const desc = document.createElement('p');
    desc.textContent = product.description;

    const price = document.createElement('p');
    price.textContent = `Price: ${product.price}€`;

    const button = document.createElement('button');
    button.textContent = 'Add to Cart';
    button.className = 'add-to-cart';

    button.addEventListener('click', () => {
      addToCart(product);
    });

    article.appendChild(title);
    article.appendChild(desc);
    article.appendChild(price);
    article.appendChild(button);

    productListElement.appendChild(article);
  });
}

clearCartButton.addEventListener('click', () => {
  cartItems = [];
  cartTotal = 0.00;
  cartCount = 0;

  cartCountElement.innerText = cartCount;
  cartTotalElement.textContent = cartTotal.toFixed(2);
  renderCartItems();
});



loadProductsFromApi();