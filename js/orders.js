'use strict';

function formatPrice(p) { return (p || 0).toLocaleString('vi-VN') + 'đ'; }

const PAY_LABELS = {
  cod: 'COD',
  bank: 'Chuyển khoản ngân hàng',
  momo: 'Ví MoMo',
  zalopay: 'ZaloPay'
};

const PAY_STATUS = {
  cod: { text: 'Chờ thanh toán', cls: 'pending' },
  bank: { text: 'Đã thanh toán', cls: 'paid' },
  momo: { text: 'Đã thanh toán', cls: 'paid' },
  zalopay: { text: 'Đã thanh toán', cls: 'paid' }
};

function renderOrders() {
  const list = document.getElementById('ordersList');
  if (!list) return;
  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem('orders')) || [];
  } catch (e) {
    orders = [];
  }

  const badge = document.getElementById('cartCount');
  let cartCount = 0;
  try {
    cartCount = (JSON.parse(localStorage.getItem('cart')) || []).reduce((s, i) => s + (i.quantity || 1), 0);
  } catch (e) { cartCount = 0; }
  if (badge) badge.textContent = cartCount;

  if (!orders.length) {
    list.innerHTML = `
      <div class="empty-orders">
        <i class="fas fa-box-open"></i>
        <h3>Chưa có đơn hàng nào</h3>
        <p>Bạn chưa đặt hàng tại ShopOnline. Khám phá sản phẩm nổi bật ngay nhé!</p>
        <a href="index.html#products" class="btn btn-primary">Mua sắm ngay</a>
      </div>`;
    return;
  }

  list.innerHTML = orders.map(order => {
    const status = PAY_STATUS[order.payment] || PAY_STATUS.cod;
    const itemsHtml = (order.items || []).map(item => `
      <div class="order-item-line">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <span class="oil-name">${item.name}</span>
        <span class="oil-qty">x${item.quantity}</span>
        <span class="oil-price">${formatPrice(item.price * item.quantity)}</span>
      </div>`).join('');

    return `
      <div class="order-card">
        <div class="order-head">
          <div>
            <span class="order-id"><i class="fas fa-receipt"></i> ${order.id}</span>
            <span class="order-time"><i class="far fa-clock"></i> ${order.time}</span>
          </div>
          <span class="status-badge ${status.cls}">${status.text}</span>
        </div>
        <div class="order-items">
          <div class="order-item-line head">
            <span class="oil-name">Sản phẩm</span>
            <span class="oil-qty">SL</span>
            <span class="oil-price">Thành tiền</span>
          </div>
          ${itemsHtml}
        </div>
        <div class="order-foot">
          <div class="of-pay">
            <span>Phương thức: <b>${PAY_LABELS[order.payment] || order.payment || 'COD'}</b></span>
            <span>Ship: ${order.ship ? formatPrice(order.ship) : 'Miễn phí'}</span>
          </div>
          <span class="of-total">Tổng: <b>${formatPrice(order.total)}</b></span>
        </div>
      </div>`;
  }).join('');
}

document.getElementById('menuToggle')?.addEventListener('click', function () {
  document.querySelector('.nav')?.classList.toggle('open');
});

renderOrders();
