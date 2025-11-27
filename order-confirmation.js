const params = new URLSearchParams(window.location.search);

const orderId = params.get('orderId');
const total   = params.get('total');

const orderIdElement   = document.getElementById('order-id');
const totalElement     = document.getElementById('order-total'); 

if (orderIdElement && orderId) {
  orderIdElement.textContent = orderId;
}

if (totalElement && total) {
  totalElement.textContent = total + ' €';
}
