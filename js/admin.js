/**
 * ShopOnline Admin Dashboard Logic
 * - Quản lý thống kê, doanh thu
 * - Quản lý đơn hàng
 * - Thêm / Ẩn / Xóa sản phẩm
 * - Cài đặt cấu hình nhận tin qua Discord Webhook
 */

'use strict';

function formatPrice(p) { return (p || 0).toLocaleString('vi-VN') + 'đ'; }

// Toast phụ trợ
function showToast(msg, type = 'info', duration = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast';
  t.classList.add(type, 'show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

// Chuyển Tab trong Admin
function initNavigation() {
  const navLinks = document.querySelectorAll('.admin-nav a');
  const sections = document.querySelectorAll('.admin-section');
  const sectionTitle = document.getElementById('sectionTitle');

  const titles = {
    overview: '<i class="fas fa-chart-pie"></i> Tổng quan cửa hàng',
    discord: '<i class="fab fa-discord"></i> Cài đặt Discord Webhook',
    orders: '<i class="fas fa-shopping-bag"></i> Quản lý đơn hàng',
    products: '<i class="fas fa-tshirt"></i> Quản lý sản phẩm',
    users: '<i class="fas fa-users"></i> Danh sách khách hàng'
  };

  function switchTab(tabId) {
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.tab === tabId));
    sections.forEach(s => s.classList.toggle('active', s.id === `sec-${tabId}`));
    if (sectionTitle && titles[tabId]) sectionTitle.innerHTML = titles[tabId];
  }

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    });
  });

  document.querySelector('.view-orders-link')?.addEventListener('click', e => {
    e.preventDefault();
    switchTab('orders');
  });

  // Nếu có hash trên URL (ví dụ #discord) thì mở luôn tab đó
  const hash = window.location.hash.replace('#', '');
  if (hash && titles[hash]) switchTab(hash);
}

/* ==========================================================
   1. CÀI ĐẶT DISCORD WEBHOOK
   ========================================================== */
function initDiscordSettings() {
  const input = document.getElementById('adminWebhookInput');
  const checkOrder = document.getElementById('notifyOrderCheck');
  const checkUser = document.getElementById('notifyUserCheck');
  const form = document.getElementById('discordAdminForm');
  const testBtn = document.getElementById('adminTestDiscordBtn');
  const statusPill = document.getElementById('discordStatusPill');

  const cfg = JSON.parse(localStorage.getItem('shopDiscordConfig') || '{}');
  if (input) input.value = cfg.webhookUrl || '';
  if (checkOrder) checkOrder.checked = cfg.notifyOrder !== false;
  if (checkUser) checkUser.checked = cfg.notifyUser !== false;

  updateStatusPill(cfg.webhookUrl);

  function updateStatusPill(url) {
    if (!statusPill) return;
    if (url) {
      statusPill.className = 'status-pill connected';
      statusPill.innerHTML = '<i class="fas fa-circle" style="font-size:8px;"></i> Discord: Đang bật';
    } else {
      statusPill.className = 'status-pill disconnected';
      statusPill.innerHTML = '<i class="far fa-circle" style="font-size:8px;"></i> Discord: Chưa kết nối';
    }
  }

  // Lưu cấu hình
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const webhookUrl = input.value.trim();
    const notifyOrder = checkOrder.checked;
    const notifyUser = checkUser.checked;

    localStorage.setItem('shopDiscordConfig', JSON.stringify({
      webhookUrl,
      notifyOrder,
      notifyUser
    }));

    updateStatusPill(webhookUrl);
    showToast('✅ Đã lưu cấu hình Discord Webhook thành công!', 'success');
  });

  // Gửi tin nhắn thử
  testBtn?.addEventListener('click', async () => {
    const webhookUrl = input.value.trim();
    if (!webhookUrl) {
      showToast('⚠️ Vui lòng dán link Discord Webhook trước!', 'error');
      return;
    }

    showToast('⏳ Đang gửi tin nhắn thử vào Discord...', 'info');
    try {
      const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(webhookUrl);
      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'ShopOnline Admin',
          avatar_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100',
          content: '🎉 **KẾT NỐI DISCORD THÀNH CÔNG!**',
          embeds: [
            {
              title: '🟢 Hệ thống quản trị ShopOnline đã kết nối',
              color: 5793266, // Xanh lá Discord
              description: 'Từ bây giờ, mọi đơn hàng khách đặt trên website sẽ tự động bắn thông báo chuông ting ting về kênh này!',
              fields: [
                { name: '🌐 Trang web', value: 'cthanh.io.vn', inline: true },
                { name: '⚡ Trạng thái', value: 'Sẵn sàng nhận thông báo', inline: true }
              ],
              footer: { text: 'ShopOnline Admin Dashboard' },
              timestamp: new Date().toISOString()
            }
          ]
        })
      });

      if (res.ok) {
        showToast('✅ Tin nhắn đã gửi về kênh Discord của bạn thành công!', 'success');
        if (typeof window.playNotificationSound === 'function') window.playNotificationSound();
      } else {
        showToast('❌ Gửi thất bại! Vui lòng kiểm tra lại đường link Webhook.', 'error');
      }
    } catch (err) {
      showToast('❌ Lỗi kết nối mạng đến Discord!', 'error');
    }
  });
}

/* ==========================================================
   2. TỔNG QUAN & DOANH THU
   ========================================================== */
function loadStats() {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const users = JSON.parse(localStorage.getItem('shopUsers') || '[]');
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const revEl = document.getElementById('statRevenue');
  const ordEl = document.getElementById('statOrders');
  const usrEl = document.getElementById('statUsers');
  const prdEl = document.getElementById('statProducts');

  if (revEl) revEl.textContent = formatPrice(totalRevenue);
  if (ordEl) ordEl.textContent = orders.length;
  if (usrEl) usrEl.textContent = users.length;
  if (prdEl) prdEl.textContent = (window.PRODUCTS || []).length;

  // Render 5 đơn mới nhất
  const recentBody = document.getElementById('recentOrdersBody');
  if (recentBody) {
    if (!orders.length) {
      recentBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#9CA3AF;padding:25px;">Chưa có đơn hàng nào</td></tr>';
    } else {
      recentBody.innerHTML = orders.slice(0, 5).map(o => `
        <tr>
          <td><b>${o.id}</b></td>
          <td>${o.name}</td>
          <td>${o.phone}</td>
          <td><b>${formatPrice(o.total)}</b></td>
          <td><span class="badge-status ${o.payment}">${o.payment}</span></td>
          <td>${o.time}</td>
        </tr>
      `).join('');
    }
  }
}

/* ==========================================================
   3. QUẢN LÝ ĐƠN HÀNG
   ========================================================== */
function loadOrdersTable() {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const body = document.getElementById('allOrdersBody');
  if (!body) return;

  if (!orders.length) {
    body.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#9CA3AF;padding:30px;">Chưa có đơn hàng nào</td></tr>';
    return;
  }

  body.innerHTML = orders.map((o, idx) => {
    const itemsList = (o.items || []).map(i => `${i.name} (x${i.quantity})`).join(', ');
    return `
      <tr>
        <td><b>${o.id}</b></td>
        <td>${o.name}</td>
        <td><a href="tel:${o.phone}">${o.phone}</a></td>
        <td><small>${o.address}, ${o.city}</small></td>
        <td><small>${itemsList}</small></td>
        <td><b style="color:#7C3AED;">${formatPrice(o.total)}</b></td>
        <td><span class="badge-status ${o.payment}">${o.payment}</span></td>
        <td><small>${o.time}</small></td>
        <td>
          <button class="btn btn-sm btn-outline delete-order-btn" data-index="${idx}" style="color:#EF4444;border-color:#FCA5A5;">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Xóa đơn đơn lẻ
  body.querySelectorAll('.delete-order-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = parseInt(this.dataset.index, 10);
      if (confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
        const curOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        curOrders.splice(idx, 1);
        localStorage.setItem('orders', JSON.stringify(curOrders));
        loadStats();
        loadOrdersTable();
        showToast('Đã xóa đơn hàng', 'info');
      }
    });
  });
}

// Nút làm mới đơn
document.getElementById('refreshOrdersBtn')?.addEventListener('click', () => {
  loadStats();
  loadOrdersTable();
  showToast('Đã cập nhật danh sách đơn', 'info');
});

// Xóa tất cả đơn test
document.getElementById('clearAllOrdersBtn')?.addEventListener('click', () => {
  if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử đơn hàng để test lại từ đầu?')) {
    localStorage.removeItem('orders');
    loadStats();
    loadOrdersTable();
    showToast('Đã xóa toàn bộ đơn hàng', 'info');
  }
});

/* ==========================================================
   4. QUẢN LÝ SẢN PHẨM
   ========================================================== */
function loadProductsTable() {
  const body = document.getElementById('adminProductTableBody');
  const countEl = document.getElementById('totalProductCount');
  if (!body) return;

  const hiddenIds = JSON.parse(localStorage.getItem('shopHiddenIds') || '[]').map(String);
  const products = window.PRODUCTS || [];
  if (countEl) countEl.textContent = products.length;

  body.innerHTML = products.map(p => {
    const isHidden = hiddenIds.includes(String(p.id));
    return `
      <tr style="${isHidden ? 'opacity:0.5;background:#FEF2F2;' : ''}">
        <td><img src="${p.image}" alt="${p.name}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;"></td>
        <td><b>${p.name}</b></td>
        <td><span style="text-transform:capitalize;">${p.category}</span></td>
        <td><b>${formatPrice(p.price)}</b></td>
        <td>
          <button class="btn btn-sm ${isHidden ? 'btn-success' : 'btn-outline'} toggle-hide-btn" data-id="${p.id}">
            <i class="fas ${isHidden ? 'fa-eye' : 'fa-eye-slash'}"></i> ${isHidden ? 'Hiện lại' : 'Ẩn đi'}
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Ẩn / Hiện sản phẩm
  body.querySelectorAll('.toggle-hide-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = String(this.dataset.id);
      let curHidden = JSON.parse(localStorage.getItem('shopHiddenIds') || '[]').map(String);
      if (curHidden.includes(id)) {
        curHidden = curHidden.filter(x => x !== id);
        showToast('Đã cho phép hiển thị lại sản phẩm trên web', 'success');
      } else {
        curHidden.push(id);
        showToast('Đã ẩn sản phẩm khỏi web', 'info');
      }
      localStorage.setItem('shopHiddenIds', JSON.stringify(curHidden));
      location.reload();
    });
  });
}

// Thêm sản phẩm mới
document.getElementById('addProductForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('pName').value.trim();
  const price = parseInt(document.getElementById('pPrice').value, 10);
  const category = document.getElementById('pCategory').value;
  const image = document.getElementById('pImage').value.trim() || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600';
  const description = document.getElementById('pDesc').value.trim();

  const customProducts = JSON.parse(localStorage.getItem('customProducts') || '[]');
  const newProduct = {
    id: Date.now(),
    name,
    price,
    category,
    image,
    description: description || name
  };

  customProducts.unshift(newProduct);
  localStorage.setItem('customProducts', JSON.stringify(customProducts));
  showToast('🎉 Đã thêm sản phẩm mới thành công!', 'success');
  this.reset();
  setTimeout(() => location.reload(), 800);
});

/* ==========================================================
   5. QUẢN LÝ KHÁCH HÀNG
   ========================================================== */
function loadUsersTable() {
  const users = JSON.parse(localStorage.getItem('shopUsers') || '[]');
  const body = document.getElementById('usersTableBody');
  if (!body) return;

  if (!users.length) {
    body.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#9CA3AF;padding:30px;">Chưa có khách hàng đăng ký</td></tr>';
    return;
  }

  body.innerHTML = users.map((u, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><b>${u.name}</b></td>
      <td><a href="tel:${u.phone}">${u.phone}</a></td>
      <td>${u.email || '<span style="color:#9CA3AF;">Không có</span>'}</td>
      <td><small>${u.createdAt || 'N/A'}</small></td>
    </tr>
  `).join('');
}

function checkAdminAuth() {
  const overlay = document.getElementById('adminLoginOverlay');
  const isAuth = sessionStorage.getItem('adminAuthenticated') === 'true';
  if (isAuth && overlay) {
    overlay.style.display = 'none';
  } else if (overlay) {
    overlay.style.display = 'flex';
  }

  document.getElementById('adminLoginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const pass = document.getElementById('adminPassInput').value;
    const currentAdminPass = localStorage.getItem('shopAdminPass') || 'admin123';
    if (pass === currentAdminPass) {
      sessionStorage.setItem('adminAuthenticated', 'true');
      if (overlay) overlay.style.display = 'none';
      showToast('✅ Đăng nhập quản trị viên thành công!', 'success');
    } else {
      showToast('❌ Mật khẩu Admin không chính xác!', 'error');
    }
  });

  document.getElementById('adminLogoutLink')?.addEventListener('click', e => {
    e.preventDefault();
    sessionStorage.removeItem('adminAuthenticated');
    location.reload();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
  initNavigation();
  initDiscordSettings();
  loadStats();
  loadOrdersTable();
  loadProductsTable();
  loadUsersTable();
});
