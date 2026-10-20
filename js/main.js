'use strict';

let cart = [];
try {
  cart = JSON.parse(localStorage.getItem('cart')) || [];
} catch (error) {
  console.warn('Không thể đọc giỏ hàng:', error);
  cart = [];
}

function saveCart() { localStorage.setItem('cart', JSON.stringify(cart)); }
function formatPrice(p) { return p.toLocaleString('vi-VN') + 'đ'; }
function getCartTotal() { return cart.reduce((s, i) => s + i.price * i.quantity, 0); }

function updateBadge() {
  const total = cart.reduce((s, i) => s + i.quantity, 0);
  document.querySelectorAll('#cartCount').forEach(el => el.textContent = total);
}

function renderCart() {
  const body = document.getElementById('cartBody');
  const total = document.getElementById('cartTotal');
  if (!body || !total) return;
  if (cart.length === 0) {
    body.innerHTML = '<p style="text-align:center;color:#888;padding:30px;">🛒 Giỏ hàng trống</p>';
    total.textContent = '0đ';
    updateBadge();
    return;
  }
  let html = '';
  cart.forEach(item => {
    html += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <div class="price">${formatPrice(item.price)}</div>
          <div class="cart-item-actions">
            <button onclick="updateQty(${item.id}, -1)">−</button>
            <span>${item.quantity}</span>
            <button onclick="updateQty(${item.id}, 1)">+</button>
            <button class="remove-item" onclick="removeItem(${item.id})"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
      </div>
    `;
  });
  body.innerHTML = html;
  total.textContent = formatPrice(getCartTotal());
  updateBadge();
}

function addToCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const exist = cart.find(x => x.id === id);
  if (exist) exist.quantity++;
  else cart.push({ ...p, quantity: 1 });
  saveCart();
  renderCart();
  openCart();
  showToast(`✅ Đã thêm "${p.name}"`, 'success');
}

function updateQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter(x => x.id !== id);
  saveCart();
  renderCart();
}

function removeItem(id) {
  const item = cart.find(x => x.id === id);
  if (item) showToast(`🗑️ Xóa "${item.name}"`, 'info');
  cart = cart.filter(x => x.id !== id);
  saveCart();
  renderCart();
}

function openCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) sidebar.classList.add('active');
  if (overlay) overlay.classList.add('active');
}
function closeCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) sidebar.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

// Slider
let current = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
let interval;

function goTo(i) {
  if (!slides.length) return;
  if (i < 0) i = slides.length - 1;
  if (i >= slides.length) i = 0;
  current = i;
  const slider = document.querySelector('.slider');
  if (slider) slider.style.transform = `translateX(-${i * 100}%)`;
  dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
}
function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }
function startSlide() { interval = setInterval(next, 4000); }
function stopSlide() { clearInterval(interval); }

// Helpers cho product card
const BADGES = ['badge-sale', 'badge-new', 'badge-hot'];
const BADGE_LABELS = ['SALE', 'NEW', 'HOT'];
const RATINGS = [
  { stars: 5,   half: false, count: 284 },
  { stars: 4,   half: true,  count: 128 },
  { stars: 5,   half: false, count: 97  },
  { stars: 4,   half: false, count: 213 },
  { stars: 4,   half: true,  count: 156 },
];
const OLD_PRICE_FACTOR = [1.2, 1.3, 1.15, 1.25, 1.35];

function getProductBadge(id) {
  const idx = id % 5;
  if (idx === 0) return `<span class="product-badge ${BADGES[0]}">${BADGE_LABELS[0]}</span>`;
  if (idx === 1) return `<span class="product-badge ${BADGES[1]}">${BADGE_LABELS[1]}</span>`;
  if (idx === 2) return `<span class="product-badge ${BADGES[2]}">${BADGE_LABELS[2]}</span>`;
  return '';
}

function getRatingHTML(id) {
  const r = RATINGS[id % RATINGS.length];
  let stars = '';
  for (let i = 0; i < r.stars; i++) stars += '<i class="fas fa-star"></i>';
  if (r.half) stars += '<i class="fas fa-star-half-alt"></i>';
  return `<div class="product-rating">
    <span class="stars">${stars}</span>
    <span class="rating-count">(${r.count})</span>
  </div>`;
}

function getOldPrice(price, id) {
  const factor = OLD_PRICE_FACTOR[id % OLD_PRICE_FACTOR.length];
  return Math.round(price * factor / 1000) * 1000;
}

// Render sản phẩm
function renderProducts(cat = 'all') {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const filtered = cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === cat);
  if (!filtered.length) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:60px;color:#9CA3AF;font-size:16px;">Không có sản phẩm nào</p>';
    return;
  }
  grid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <div class="product-card-img">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        ${getProductBadge(p.id)}
        <button class="product-wishlist" aria-label="Yêu thích">
          <i class="far fa-heart"></i>
        </button>
      </div>
      <div class="product-info">
        <div class="category">${p.category}</div>
        <h3>${p.name}</h3>
        ${getRatingHTML(p.id)}
        <div class="product-price-row">
          <div>
            <div class="price">${formatPrice(p.price)}</div>
            <div class="price-old">${formatPrice(getOldPrice(p.price, p.id))}</div>
          </div>
          <button class="btn-cart view-detail" data-id="${p.id}">
            <i class="fas fa-cart-plus"></i> Thêm
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Click thêm vào giỏ trực tiếp từ card
  document.querySelectorAll('.view-detail').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = parseInt(this.dataset.id);
      addToCart(id);
    });
  });

  // Click vào card → trang chi tiết (trừ nút giỏ & wishlist)
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.closest('.btn-cart') || e.target.closest('.product-wishlist')) return;
      const btn = this.querySelector('.view-detail');
      if (btn) window.location.href = `product.html?id=${btn.dataset.id}`;
    });
    card.style.cursor = 'pointer';
  });

  // Wishlist toggle (UI only)
  document.querySelectorAll('.product-wishlist').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const icon = this.querySelector('i');
      icon.classList.toggle('far');
      icon.classList.toggle('fas');
      this.style.color = icon.classList.contains('fas') ? '#EC4899' : '';
    });
  });
}

// Chi tiết
function loadDetail() {
  const detail = document.getElementById('productDetail');
  if (!detail) return;

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);
  if (!id) {
    detail.innerHTML = `
      <div style="text-align:center;padding:60px 20px;grid-column:1/-1;">
        <i class="fas fa-search" style="font-size:48px;color:#9CA3AF;margin-bottom:16px;"></i>
        <h3 style="font-size:20px;margin-bottom:10px;color:#1F2937;">Chưa chọn sản phẩm</h3>
        <p style="font-size:15px;color:#6B7280;margin-bottom:20px;">Vui lòng chọn một sản phẩm từ trang chủ để xem chi tiết.</p>
        <a href="index.html#products" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Về danh sách sản phẩm</a>
      </div>
    `;
    return;
  }

  const detailImg    = document.getElementById('detailImg');
  const detailName   = document.getElementById('detailName');
  const detailPrice  = document.getElementById('detailPrice');
  const detailDesc   = document.getElementById('detailDesc');
  const detailCat    = document.getElementById('detailCategory');
  const breadcrumb   = document.getElementById('breadcrumbName');
  const addToCartDetail = document.getElementById('addToCartDetail');

  const p = PRODUCTS.find(x => x.id === id);
  if (!p) {
    detail.innerHTML = `
      <div style="text-align:center;padding:60px 20px;grid-column:1/-1;">
        <i class="fas fa-exclamation-circle" style="font-size:48px;color:#EF4444;margin-bottom:16px;"></i>
        <h3 style="font-size:20px;margin-bottom:10px;color:#1F2937;">Không tìm thấy sản phẩm</h3>
        <p style="font-size:15px;color:#6B7280;margin-bottom:20px;">Sản phẩm bạn đang tìm không tồn tại hoặc đã bị gỡ.</p>
        <a href="index.html#products" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Về danh sách sản phẩm</a>
      </div>
    `;
    return;
  }

  if (detailImg)   detailImg.src = p.image;
  if (detailImg)   detailImg.alt = p.name;
  if (detailName)  detailName.textContent = p.name;
  if (detailPrice) detailPrice.textContent = formatPrice(p.price);
  if (detailDesc)  detailDesc.textContent = p.description;
  if (detailCat)   detailCat.textContent = p.category.charAt(0).toUpperCase() + p.category.slice(1);
  if (breadcrumb)  breadcrumb.textContent = p.name;
  document.title = `ShopOnline – ${p.name}`;

  if (addToCartDetail) {
    addToCartDetail.addEventListener('click', () => addToCart(p.id));
  }
}

// Toast
function showToast(msg, type = 'info', duration = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast';
  t.classList.add(type, 'show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

// Filter
function initFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  if (!buttons.length) return;
  buttons.forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderProducts(this.dataset.filter);
    });
  });
}

// Mobile nav
function initMobileNav() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }
}

// Events
function initEvents() {
  document.getElementById('cartToggle')?.addEventListener('click', e => { e.preventDefault(); openCart(); });
  document.getElementById('closeCart')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('prevSlide')?.addEventListener('click', () => { stopSlide(); prev(); startSlide(); });
  document.getElementById('nextSlide')?.addEventListener('click', () => { stopSlide(); next(); startSlide(); });
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { stopSlide(); goTo(i); startSlide(); });
  });
  const banner = document.querySelector('.banner');
  if (banner) { banner.addEventListener('mouseenter', stopSlide); banner.addEventListener('mouseleave', startSlide); }
}

// Start
document.addEventListener('DOMContentLoaded', function() {
  const isProductPage = !!document.getElementById('productDetail') || window.location.pathname.toLowerCase().includes('product.html');
  if (isProductPage) {
    loadDetail();
    renderCart();
    initEvents();
    initMobileNav();
    updateBadge();
    return;
  }
  renderProducts('all');
  initFilter();
  initEvents();
  initMobileNav();
  if (slides.length) { goTo(0); startSlide(); }
  renderCart();
});

window.addToCart = addToCart;
window.updateQty = updateQty;
window.removeItem = removeItem;
window.openCart = openCart;
window.closeCart = closeCart;
window.showToast = showToast;
