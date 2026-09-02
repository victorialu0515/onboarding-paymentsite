const MENU_ITEMS = [
  { id: 'bbq-buns', name: 'BBQ Pork Bun', price: 5.5 },
  { id: 'egg-tart', name: 'Egg Tart', price: 3.5 },
  { id: 'pheonix-bun', name: 'Pheonix Bun', price: 4.5 },
  { id: 'xiao-long-bao', name: 'Xiao Long Bao', price: 6.25 },
  { id: 'har-gow', name: 'Har Gow', price: 5.75 },
  { id: 'sesame-ball', name: 'Red Bean Sesame Ball', price: 3.80 },
  { id: 'mango-pudding', name: 'Mango Pudding', price: 3.50 },
  { id: 'tea', name: 'Tea', price: 1.25 },
];

const cart = {};

const customerNameInput = document.getElementById('customer-name');
const menuList = document.getElementById('menu-list');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

function renderMenu() {
  menuList.innerHTML = '';
  MENU_ITEMS.forEach((item) => {
    const qty = cart[item.id] || 0;

    const row = document.createElement('div');
    row.className = qty > 0 ? 'menu-item in-cart' : 'menu-item';

    row.innerHTML = `
      <img class="menu-item-thumb" src="/images/${item.id}.jpg" alt="${item.name}">
      <div class="menu-item-body">
        <div class="menu-item-name">${item.name}</div>
        <div class="menu-item-price">$${item.price.toFixed(2)}</div>
        <div class="qty-control">
          <button class="qty-btn" data-action="dec" data-id="${item.id}" ${qty === 0 ? 'disabled' : ''}>−</button>
          <span class="qty-value">${qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
        </div>
      </div>
    `;

    menuList.appendChild(row);
  });
}

function renderCartSummary() {
  const totalQty = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = MENU_ITEMS.reduce((sum, item) => sum + (cart[item.id] || 0) * item.price, 0);

  cartCount.textContent = totalQty === 0 ? 'Your cart is empty' : `${totalQty} item${totalQty > 1 ? 's' : ''} in cart`;
  cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
  checkoutBtn.disabled = totalQty === 0 || !customerNameInput.value.trim();
}

customerNameInput.addEventListener('input', renderCartSummary);


function changeQty(id, delta) {
  const next = (cart[id] || 0) + delta;
  if (next <= 0) {
    delete cart[id];
  } else {
    cart[id] = next;
  }
  renderMenu();
  renderCartSummary();
}

menuList.addEventListener('click', (event) => {
  const btn = event.target.closest('.qty-btn');
  if (!btn) return;
  const delta = btn.dataset.action === 'inc' ? 1 : -1;
  changeQty(btn.dataset.id, delta);
});

checkoutBtn.addEventListener('click', () => {
  const order = MENU_ITEMS.filter((item) => cart[item.id] > 0).map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    qty: cart[item.id],
  }));
  const amount = order.reduce((sum, item) => sum + item.price * item.qty, 0);
  const customerName = customerNameInput.value.trim();

  sessionStorage.setItem('dimSumOrder', JSON.stringify(order));
  sessionStorage.setItem('customerName', customerName);
  window.location.href = `/checkout.html?amount=${amount.toFixed(2)}`;
});

renderMenu();
renderCartSummary();
