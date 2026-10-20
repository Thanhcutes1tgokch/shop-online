'use strict';

/* ---------- Đọc giỏ hàng từ localStorage (chung với main.js) ---------- */
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem('cart')) || [];
} catch (e) {
  cart = [];
}

function formatPrice(p) { return p.toLocaleString('vi-VN') + 'đ'; }

const FREE_SHIP_THRESHOLD = 500000;
const SHIP_FEE = 30000;

function updateBadge() {
  const total = cart.reduce((s, i) => s + i.quantity, 0);
  document.querySelectorAll('#cartCount').forEach(el => el.textContent = total);
  const count = document.getElementById('orderCount');
  if (count) count.textContent = total;
}

function getSubtotal() { return cart.reduce((s, i) => s + i.price * i.quantity, 0); }
function getShipFee(subtotal) { return subtotal >= FREE_SHIP_THRESHOLD || subtotal === 0 ? 0 : SHIP_FEE; }

function renderSummary() {
  const list = document.getElementById('orderItems');
  const subtotal = getSubtotal();
  const ship = getShipFee(subtotal);
  const total = subtotal + ship;

  if (cart.length === 0) {
    list.innerHTML = '<p class="empty-text">Giỏ hàng trống. <a href="index.html#products">Mua sắm ngay</a></p>';
    document.getElementById('subTotal').textContent = '0đ';
    document.getElementById('shipCost').innerHTML = '<span class="free-tag">Miễn phí</span>';
    document.getElementById('grandTotal').textContent = '0đ';
    updateBadge();
    return;
  }

  let html = '';
  cart.forEach(item => {
    html += `
      <div class="order-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="oi-info">
          <b>${item.name}</b>
          <span>${formatPrice(item.price)} × ${item.quantity}</span>
        </div>
        <span class="oi-price">${formatPrice(item.price * item.quantity)}</span>
      </div>
    `;
  });
  list.innerHTML = html;

  document.getElementById('subTotal').textContent = formatPrice(subtotal);
  document.getElementById('shipCost').innerHTML = ship === 0
    ? '<span class="free-tag">Miễn phí</span>'
    : formatPrice(ship);
  document.getElementById('grandTotal').textContent = formatPrice(total);
  updateBadge();
}

/* ---------- Xác nhận đơn hàng ---------- */
document.getElementById('placeOrder').addEventListener('click', function () {
  if (cart.length === 0) {
    showToast('🛒 Giỏ hàng trống', 'info');
    return;
  }
  const name = document.getElementById('cName').value.trim();
  const phone = document.getElementById('cPhone').value.trim();
  const city = document.getElementById('cCity').value.trim();
  const address = document.getElementById('cAddress').value.trim();

  if (!name || !phone || !city || !address) {
    showToast('⚠️ Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
    return;
  }
  if (!/^\d{9,12}$/.test(phone.replace(/[\s.-]/g, ''))) {
    showToast('⚠️ Số điện thoại không hợp lệ', 'error');
    return;
  }

  const subtotal = getSubtotal();
  const total = subtotal + getShipFee(subtotal);
  const payLabel = document.querySelector('input[name="payment"]:checked').value;

  const order = {
    id: '#' + Date.now().toString().slice(-6),
    name, phone, city, address,
    email: document.getElementById('cEmail').value.trim(),
    note: document.getElementById('cNote').value.trim(),
    payment: payLabel,
    items: cart,
    subtotal,
    ship: getShipFee(subtotal),
    total,
    time: new Date().toLocaleString('vi-VN')
  };

  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  localStorage.removeItem('cart');
  cart = [];

  document.getElementById('orderId').textContent = order.id;
  document.getElementById('successPay').textContent = payLabel.toUpperCase();
  document.getElementById('successTotal').textContent = formatPrice(order.total);
  document.getElementById('successOverlay').classList.add('active');
  renderSummary();
});

function closeSuccess() {
  document.getElementById('successOverlay').classList.remove('active');
}

document.getElementById('successOverlay').addEventListener('click', function (e) {
  if (e.target === this) closeSuccess();
});

/* ---------- Mobile menu toggle ---------- */
document.getElementById('menuToggle')?.addEventListener('click', function () {
  document.querySelector('.nav')?.classList.toggle('open');
});

/* ---------- Toast (dùng chung) ---------- */
let _timer;
function showToast(msg, type = 'info', duration = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast';
  t.classList.add(type, 'show');
  clearTimeout(_timer);
  _timer = setTimeout(() => t.classList.remove('show'), duration);
}

renderSummary();
