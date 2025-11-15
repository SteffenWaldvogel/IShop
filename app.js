const products = [
  { id: 1, name: 'Product 1', description: 'Description of Product 1', price: 129.99 },
  { id: 2, name: 'Product 2', description: 'Description of Product 2', price: 129.99 },
  { id: 3, name: 'Product 3', description: 'Description of Product 3', price: 129.99 }
];

let cartItems = [];
let cartTotal = 0.00;
let cartCount = 0;

const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');
const cartItemsElement = document.getElementById('cart-items');
const clearCartButton = document.getElementById('clear-cart');
const productListElement = document.getElementById('product-list');

function renderCartItems() {
  cartItemsElement.innerHTML = '';
  cartItems.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} - €${item.price}`;
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

    article.appendChild(title);
    article.appendChild(desc);
    article.appendChild(price);
    article.appendChild(button);

    productListElement.appendChild(article);
  });
}

renderProducts();

const buttons = document.querySelectorAll('.add-to-cart');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    cartCount++;
    cartCountElement.innerText = cartCount;

    const article = button.closest('article');
    const productName = article.dataset.productName;
    const productPrice = article.dataset.productPrice;

    console.log(`Added to cart: ${productName} - €${productPrice}`);

    cartTotal += parseFloat(productPrice);
    cartTotalElement.textContent = cartTotal.toFixed(2);

    cartItems.push({ name: productName, price: productPrice });
    console.log('Cart Items:', cartItems);

    renderCartItems();
  });
});

clearCartButton.addEventListener('click', () => {
  cartItems = [];
  cartTotal = 0.00;
  cartCount = 0;

  cartCountElement.innerText = cartCount;
  cartTotalElement.textContent = cartTotal.toFixed(2);
  renderCartItems();
});
