/**
 * ShopOnline Notification System
 * - Chuông thông báo âm thanh (Web Audio API)
 * - Thông báo hệ điều hành / Trình duyệt (Browser Notification API)
 * - Gửi tin nhắn về Telegram của chủ shop khi có Đơn hàng / Đăng ký mới
 * - Trung tâm thông báo (Notification Bell) trên Header
 */

'use strict';

// Phát âm thanh "Ting ting" thông báo
function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Nốt thứ 1 (D5 - 587Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Nốt thứ 2 (A5 - 880Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.3, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    console.log('AudioContext không khả dụng:', e);
  }
}

// Yêu cầu quyền thông báo trình duyệt
function requestBrowserNotify() {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          showNotifyToast('🔔 Đã bật thông báo đẩy trình duyệt!', 'success');
        }
      });
    } else if (Notification.permission === 'granted') {
      showNotifyToast('🔔 Thông báo trình duyệt đã được bật sẵn.', 'info');
    } else {
      showNotifyToast('⚠️ Trình duyệt đang chặn thông báo. Vui lòng cấp quyền trong cài đặt trình duyệt.', 'error');
    }
  }
}

// Bắn thông báo hệ điều hành / trình duyệt
function sendBrowserNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: body,
        icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛍️</text></svg>'
      });
    } catch (e) {}
  }
}

// Gửi thông báo về Telegram của chủ shop
async function sendTelegramMessage(htmlMessage) {
  const cfg = JSON.parse(localStorage.getItem('shopTelegramConfig') || '{}');
  if (!cfg.botToken || !cfg.chatId) {
    console.log('Chưa cấu hình Telegram Bot.');
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${cfg.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cfg.chatId,
        text: htmlMessage,
        parse_mode: 'HTML'
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('Lỗi gửi Telegram:', err);
    return false;
  }
}

// Lưu thông báo vào danh sách hiển thị trên web
function addAppNotification(type, title, message) {
  const notifs = JSON.parse(localStorage.getItem('appNotifications') || '[]');
  const newNotif = {
    id: 'notif_' + Date.now(),
    type: type, // 'order' | 'user' | 'system'
    title: title,
    message: message,
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
    read: false
  };
  notifs.unshift(newNotif);
  localStorage.setItem('appNotifications', JSON.stringify(notifs.slice(0, 30)));
  renderNotifyBadge();
  renderNotifyList();
}

// Cập nhật số đỏ trên chuông thông báo
function renderNotifyBadge() {
  const notifs = JSON.parse(localStorage.getItem('appNotifications') || '[]');
  const unread = notifs.filter(n => !n.read).length;
  const badge = document.getElementById('notifyCount');
  if (badge) {
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'inline-block' : 'none';
  }
}

// Hiển thị danh sách thông báo trong dropdown
function renderNotifyList() {
  const listEl = document.getElementById('notifyDropdownList');
  if (!listEl) return;
  const notifs = JSON.parse(localStorage.getItem('appNotifications') || '[]');
  if (!notifs.length) {
    listEl.innerHTML = '<div class="notify-empty">Chưa có thông báo nào</div>';
    return;
  }

  listEl.innerHTML = notifs.map(n => `
    <div class="notify-item ${n.read ? 'read' : 'unread'}" data-id="${n.id}">
      <div class="notify-icon ${n.type}">
        <i class="fas ${n.type === 'order' ? 'fa-shopping-bag' : n.type === 'user' ? 'fa-user-check' : 'fa-bell'}"></i>
      </div>
      <div class="notify-content">
        <b>${n.title}</b>
        <p>${n.message}</p>
        <small>${n.time}</small>
      </div>
    </div>
  `).join('');

  // Đánh dấu đã đọc khi bấm vào item
  listEl.querySelectorAll('.notify-item').forEach(el => {
    el.addEventListener('click', function () {
      const id = this.dataset.id;
      markAsRead(id);
    });
  });
}

function markAsRead(id) {
  let notifs = JSON.parse(localStorage.getItem('appNotifications') || '[]');
  if (id === 'all') {
    notifs = notifs.map(n => ({ ...n, read: true }));
  } else {
    notifs = notifs.map(n => n.id === id ? { ...n, read: true } : n);
  }
  localStorage.setItem('appNotifications', JSON.stringify(notifs));
  renderNotifyBadge();
  renderNotifyList();
}

// Khi khách đặt đơn hàng mới -> gọi hàm này
async function notifyNewOrder(order) {
  playNotificationSound();
  const title = `🎉 Đơn hàng mới: ${order.id}`;
  const itemsText = (order.items || []).map(i => `• ${i.name} (x${i.quantity})`).join('\n');
  const body = `Khách: ${order.name} - SĐT: ${order.phone}\nTổng: ${(order.total || 0).toLocaleString('vi-VN')}đ`;

  // 1. Lưu vào danh sách thông báo trên web
  addAppNotification('order', title, `${order.name} vừa đặt hàng: ${(order.total || 0).toLocaleString('vi-VN')}đ (${order.payment.toUpperCase()})`);

  // 2. Bắn thông báo ra màn hình máy tính / điện thoại
  sendBrowserNotification(title, body);

  // 3. Gửi tin nhắn về Telegram của chủ shop
  const tgMsg = `<b>🛍️ CÓ ĐƠN HÀNG MỚI!</b>\n` +
    `---------------------------------\n` +
    `<b>Mã đơn:</b> ${order.id}\n` +
    `<b>Khách hàng:</b> ${order.name}\n` +
    `<b>Số điện thoại:</b> <code>${order.phone}</code>\n` +
    `<b>Địa chỉ:</b> ${order.address}, ${order.city}\n` +
    `<b>Thanh toán:</b> ${order.payment.toUpperCase()}\n` +
    `<b>Sản phẩm:</b>\n${itemsText}\n` +
    `<b>Tổng thanh toán:</b> <b>${(order.total || 0).toLocaleString('vi-VN')}đ</b>\n` +
    `<b>Thời gian:</b> ${order.time}`;
  await sendTelegramMessage(tgMsg);
}

// Khi có khách đăng ký tài khoản mới -> gọi hàm này
async function notifyNewUser(user) {
  playNotificationSound();
  const title = `👤 Người dùng mới đăng ký`;
  const body = `${user.name} (${user.email || user.phone})`;
  addAppNotification('user', title, body);
  sendBrowserNotification(title, body);

  const tgMsg = `<b>👤 THÀNH VIÊN MỚI ĐĂNG KÝ!</b>\n` +
    `---------------------------------\n` +
    `<b>Họ tên:</b> ${user.name}\n` +
    `<b>Số điện thoại:</b> ${user.phone}\n` +
    `<b>Email:</b> ${user.email || 'Không có'}\n` +
    `<b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}`;
  await sendTelegramMessage(tgMsg);
}

// Toast phụ trợ nếu trang chưa có hàm showToast
function showNotifyToast(msg, type = 'info') {
  if (typeof window.showToast === 'function') {
    window.showToast(msg, type);
  } else {
    alert(msg);
  }
}

// Khởi tạo UI Chuông thông báo trên Header
function initNotificationUI() {
  const wrapper = document.getElementById('notifyWrapper');
  if (!wrapper) return;

  wrapper.innerHTML = `
    <div class="notify-btn" id="notifyToggle" title="Thông báo">
      <i class="fas fa-bell"></i>
      <span class="notify-badge" id="notifyCount" style="display:none;">0</span>
    </div>
    <div class="notify-dropdown" id="notifyDropdown">
      <div class="notify-dropdown-header">
        <span>🔔 Thông báo của bạn</span>
        <button id="markAllReadBtn" title="Đánh dấu tất cả đã đọc"><i class="fas fa-check-double"></i> Đã đọc</button>
      </div>
      <div class="notify-dropdown-list" id="notifyDropdownList"></div>
      <div class="notify-dropdown-footer">
        <button id="openTelegramSetupBtn"><i class="fab fa-telegram-plane"></i> Cài đặt Telegram nhận tin</button>
        <button id="enableBrowserNotifyBtn"><i class="fas fa-volume-up"></i> Bật chuông đẩy</button>
      </div>
    </div>

    <!-- Modal cài đặt Telegram Bot -->
    <div class="tg-modal-overlay" id="tgModalOverlay">
      <div class="tg-modal">
        <div class="tg-modal-header">
          <h3><i class="fab fa-telegram"></i> Cài đặt nhận tin qua Telegram</h3>
          <button class="tg-modal-close" id="closeTgModal">&times;</button>
        </div>
        <div class="tg-modal-body">
          <p>Mỗi khi có <b>khách đặt hàng</b> hoặc <b>đăng ký tài khoản</b>, thông báo sẽ tự động gửi thẳng về Telegram trên điện thoại của bạn!</p>
          <div class="tg-form-group">
            <label>Bot Token:</label>
            <input type="text" id="tgBotToken" placeholder="VD: 7123456789:AAH..." />
            <small>Lấy từ @BotFather trên Telegram</small>
          </div>
          <div class="tg-form-group">
            <label>Chat ID của bạn:</label>
            <input type="text" id="tgChatId" placeholder="VD: 123456789" />
            <small>Gõ /start vào @userinfobot trên Telegram để lấy ID</small>
          </div>
        </div>
        <div class="tg-modal-footer">
          <button class="btn btn-secondary" id="testTgBtn">Gửi tin nhắn thử</button>
          <button class="btn btn-primary" id="saveTgBtn">Lưu cài đặt</button>
        </div>
      </div>
    </div>
  `;

  // Sự kiện đóng mở dropdown
  const toggle = document.getElementById('notifyToggle');
  const dropdown = document.getElementById('notifyDropdown');
  if (toggle && dropdown) {
    toggle.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });
    document.addEventListener('click', e => {
      if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  }

  // Đánh dấu đã đọc
  document.getElementById('markAllReadBtn')?.addEventListener('click', () => markAsRead('all'));

  // Bật thông báo đẩy
  document.getElementById('enableBrowserNotifyBtn')?.addEventListener('click', () => {
    requestBrowserNotify();
    playNotificationSound();
  });

  // Modal Telegram
  const tgOverlay = document.getElementById('tgModalOverlay');
  document.getElementById('openTelegramSetupBtn')?.addEventListener('click', () => {
    dropdown?.classList.remove('active');
    const cfg = JSON.parse(localStorage.getItem('shopTelegramConfig') || '{}');
    document.getElementById('tgBotToken').value = cfg.botToken || '';
    document.getElementById('tgChatId').value = cfg.chatId || '';
    tgOverlay?.classList.add('active');
  });

  document.getElementById('closeTgModal')?.addEventListener('click', () => {
    tgOverlay?.classList.remove('active');
  });

  document.getElementById('saveTgBtn')?.addEventListener('click', () => {
    const botToken = document.getElementById('tgBotToken').value.trim();
    const chatId = document.getElementById('tgChatId').value.trim();
    localStorage.setItem('shopTelegramConfig', JSON.stringify({ botToken, chatId }));
    tgOverlay?.classList.remove('active');
    showNotifyToast('✅ Đã lưu cấu hình Telegram!', 'success');
  });

  document.getElementById('testTgBtn')?.addEventListener('click', async () => {
    const botToken = document.getElementById('tgBotToken').value.trim();
    const chatId = document.getElementById('tgChatId').value.trim();
    if (!botToken || !chatId) {
      showNotifyToast('⚠️ Vui lòng nhập Bot Token và Chat ID trước!', 'error');
      return;
    }
    showNotifyToast('⏳ Đang gửi tin nhắn thử...', 'info');
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '🎉 <b>ShopOnline</b>: Kết nối Telegram thành công! Từ giờ mọi đơn hàng sẽ gửi về đây.',
          parse_mode: 'HTML'
        })
      });
      if (res.ok) {
        showNotifyToast('✅ Tin nhắn đã gửi về Telegram của bạn thành công!', 'success');
        playNotificationSound();
      } else {
        showNotifyToast('❌ Gửi thất bại! Vui lòng kiểm tra lại Bot Token hoặc Chat ID.', 'error');
      }
    } catch (e) {
      showNotifyToast('❌ Lỗi kết nối mạng đến Telegram!', 'error');
    }
  });

  renderNotifyBadge();
  renderNotifyList();
}

document.addEventListener('DOMContentLoaded', initNotificationUI);

// Xuất các hàm ra toàn cục
window.playNotificationSound = playNotificationSound;
window.requestBrowserNotify = requestBrowserNotify;
window.sendBrowserNotification = sendBrowserNotification;
window.notifyNewOrder = notifyNewOrder;
window.notifyNewUser = notifyNewUser;
