/**
 * ShopOnline Notification System
 * - Chuông thông báo âm thanh (Web Audio API)
 * - Thông báo hệ điều hành / Trình duyệt (Browser Notification API)
 * - Gửi tin nhắn về Discord Webhook (Ting ting ngay trên Discord của bạn!)
 * - Gửi tin nhắn về Telegram Bot
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

// Gửi thông báo về Discord Webhook
async function sendDiscordMessage(payload) {
  const cfg = JSON.parse(localStorage.getItem('shopDiscordConfig') || '{}');
  if (!cfg.webhookUrl) return false;

  try {
    // Discord chặn CORS từ trình duyệt web, sử dụng proxy corsproxy.io để vượt qua
    const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(cfg.webhookUrl);
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.warn('Lỗi gửi Discord:', err);
    return false;
  }
}

// Gửi thông báo về Telegram Bot
async function sendTelegramMessage(htmlMessage) {
  const cfg = JSON.parse(localStorage.getItem('shopTelegramConfig') || '{}');
  if (!cfg.botToken || !cfg.chatId) return false;
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

  listEl.querySelectorAll('.notify-item').forEach(el => {
    el.addEventListener('click', function () {
      markAsRead(this.dataset.id);
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

  // 3. Gửi tin nhắn về Discord của chủ shop (Rich Embed đẹp mắt)
  const discordPayload = {
    username: 'ShopOnline Bot',
    avatar_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100',
    content: '🔔 **BẠN CÓ ĐƠN HÀNG MỚI!**',
    embeds: [
      {
        title: `🎉 Đơn hàng ${order.id}`,
        color: 8140525, // Tím #7C3AED
        fields: [
          { name: '👤 Khách hàng', value: order.name, inline: true },
          { name: '📞 Số điện thoại', value: order.phone, inline: true },
          { name: '💳 Thanh toán', value: order.payment.toUpperCase(), inline: true },
          { name: '📍 Địa chỉ', value: `${order.address}, ${order.city}`, inline: false },
          { name: '🛍️ Sản phẩm đã đặt', value: itemsText || 'Không có', inline: false },
          { name: '💰 Tổng tiền', value: `**${(order.total || 0).toLocaleString('vi-VN')}đ**`, inline: true },
          { name: '🕒 Thời gian', value: order.time, inline: true }
        ],
        footer: { text: 'ShopOnline Notification System' }
      }
    ]
  };
  await sendDiscordMessage(discordPayload);

  // 4. Gửi tin nhắn về Telegram (nếu có cấu hình)
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

  // Bắn Discord
  const discordPayload = {
    username: 'ShopOnline Bot',
    content: '👤 **THÀNH VIÊN MỚI ĐĂNG KÝ!**',
    embeds: [
      {
        title: 'Tài khoản mới',
        color: 4177144,
        fields: [
          { name: 'Họ tên', value: user.name, inline: true },
          { name: 'SĐT', value: user.phone, inline: true },
          { name: 'Email', value: user.email || 'Không có', inline: true }
        ]
      }
    ]
  };
  await sendDiscordMessage(discordPayload);

  // Bắn Telegram
  const tgMsg = `<b>👤 THÀNH VIÊN MỚI ĐĂNG KÝ!</b>\n` +
    `---------------------------------\n` +
    `<b>Họ tên:</b> ${user.name}\n` +
    `<b>Số điện thoại:</b> ${user.phone}\n` +
    `<b>Email:</b> ${user.email || 'Không có'}\n` +
    `<b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}`;
  await sendTelegramMessage(tgMsg);
}

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
        <button id="openBotSetupBtn"><i class="fab fa-discord"></i> Cài đặt Discord / Telegram</button>
        <button id="enableBrowserNotifyBtn"><i class="fas fa-volume-up"></i> Bật chuông đẩy</button>
      </div>
    </div>

    <!-- Modal cài đặt Bot Nhận Tin (Discord & Telegram) -->
    <div class="tg-modal-overlay" id="botModalOverlay">
      <div class="tg-modal">
        <div class="tg-modal-header">
          <h3><i class="fas fa-satellite-dish"></i> Cài đặt nhận thông báo đơn hàng</h3>
          <button class="tg-modal-close" id="closeBotModal">&times;</button>
        </div>
        <div class="tg-modal-body">
          <div class="bot-tabs" style="display:flex;gap:8px;margin-bottom:15px;">
            <button type="button" class="btn btn-sm btn-primary active" id="tabDiscordBtn" style="flex:1;">
              <i class="fab fa-discord"></i> Discord Webhook
            </button>
            <button type="button" class="btn btn-sm btn-outline" id="tabTelegramBtn" style="flex:1;">
              <i class="fab fa-telegram"></i> Telegram Bot
            </button>
          </div>

          <!-- TAB DISCORD -->
          <div id="discordFormSection">
            <p style="font-size:13px;color:#4B5563;margin-bottom:12px;">
              Mỗi khi có khách <b>đặt đơn</b> hoặc <b>đăng ký</b>, bot sẽ gửi tin nhắn "Ting ting" ngay vào kênh Discord của bạn!
            </p>
            <div class="tg-form-group">
              <label>Discord Webhook URL:</label>
              <input type="text" id="discordWebhookInput" placeholder="https://discord.com/api/webhooks/..." />
              <small>Vào Discord: Cài đặt kênh &gt; Integrations &gt; Webhooks &gt; New Webhook &gt; Copy Webhook URL</small>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:15px;">
              <button class="btn btn-secondary" id="testDiscordBtn" type="button">Gửi thử vào Discord</button>
              <button class="btn btn-primary" id="saveDiscordBtn" type="button">Lưu Discord Webhook</button>
            </div>
          </div>

          <!-- TAB TELEGRAM -->
          <div id="telegramFormSection" style="display:none;">
            <p style="font-size:13px;color:#4B5563;margin-bottom:12px;">
              Nhận thông báo qua ứng dụng Telegram.
            </p>
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
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:15px;">
              <button class="btn btn-secondary" id="testTgBtn" type="button">Gửi thử qua Telegram</button>
              <button class="btn btn-primary" id="saveTgBtn" type="button">Lưu Telegram</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

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

  document.getElementById('markAllReadBtn')?.addEventListener('click', () => markAsRead('all'));

  document.getElementById('enableBrowserNotifyBtn')?.addEventListener('click', () => {
    requestBrowserNotify();
    playNotificationSound();
  });

  // Modal Setup
  const botOverlay = document.getElementById('botModalOverlay');
  document.getElementById('openBotSetupBtn')?.addEventListener('click', () => {
    dropdown?.classList.remove('active');
    const discordCfg = JSON.parse(localStorage.getItem('shopDiscordConfig') || '{}');
    const tgCfg = JSON.parse(localStorage.getItem('shopTelegramConfig') || '{}');
    document.getElementById('discordWebhookInput').value = discordCfg.webhookUrl || '';
    document.getElementById('tgBotToken').value = tgCfg.botToken || '';
    document.getElementById('tgChatId').value = tgCfg.chatId || '';
    botOverlay?.classList.add('active');
  });

  document.getElementById('closeBotModal')?.addEventListener('click', () => {
    botOverlay?.classList.remove('active');
  });

  // Tab switcher in modal
  const tabDiscordBtn = document.getElementById('tabDiscordBtn');
  const tabTelegramBtn = document.getElementById('tabTelegramBtn');
  const discordSection = document.getElementById('discordFormSection');
  const telegramSection = document.getElementById('telegramFormSection');

  tabDiscordBtn?.addEventListener('click', () => {
    tabDiscordBtn.className = 'btn btn-sm btn-primary active';
    tabTelegramBtn.className = 'btn btn-sm btn-outline';
    discordSection.style.display = 'block';
    telegramSection.style.display = 'none';
  });

  tabTelegramBtn?.addEventListener('click', () => {
    tabTelegramBtn.className = 'btn btn-sm btn-primary active';
    tabDiscordBtn.className = 'btn btn-sm btn-outline';
    telegramSection.style.display = 'block';
    discordSection.style.display = 'none';
  });

  // Lưu Discord Webhook
  document.getElementById('saveDiscordBtn')?.addEventListener('click', () => {
    const webhookUrl = document.getElementById('discordWebhookInput').value.trim();
    localStorage.setItem('shopDiscordConfig', JSON.stringify({ webhookUrl }));
    botOverlay?.classList.remove('active');
    showNotifyToast('✅ Đã lưu cấu hình Discord Webhook!', 'success');
  });

  // Test Discord Webhook
  document.getElementById('testDiscordBtn')?.addEventListener('click', async () => {
    const webhookUrl = document.getElementById('discordWebhookInput').value.trim();
    if (!webhookUrl) {
      showNotifyToast('⚠️ Vui lòng dán link Discord Webhook trước!', 'error');
      return;
    }
    showNotifyToast('⏳ Đang gửi tin nhắn thử vào Discord...', 'info');
    try {
      const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(webhookUrl);
      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'ShopOnline Bot',
          content: '🎉 **ShopOnline Test**: Kết nối Discord Webhook thành công! Từ giờ mọi đơn hàng sẽ gửi thẳng về kênh này.',
          embeds: [
            {
              title: '🚀 Hệ thống sẵn sàng hoạt động!',
              color: 5793266, // Xanh lá Discord
              description: 'Khi có khách đặt hàng trên web, bạn sẽ nhận được thông báo chi tiết ngay tại đây.'
            }
          ]
        })
      });
      if (res.ok) {
        showNotifyToast('✅ Tin nhắn đã gửi về Discord thành công!', 'success');
        playNotificationSound();
      } else {
        showNotifyToast('❌ Gửi thất bại! Vui lòng kiểm tra lại link Webhook.', 'error');
      }
    } catch (e) {
      showNotifyToast('❌ Lỗi kết nối đến Discord!', 'error');
    }
  });

  // Lưu & Test Telegram
  document.getElementById('saveTgBtn')?.addEventListener('click', () => {
    const botToken = document.getElementById('tgBotToken').value.trim();
    const chatId = document.getElementById('tgChatId').value.trim();
    localStorage.setItem('shopTelegramConfig', JSON.stringify({ botToken, chatId }));
    botOverlay?.classList.remove('active');
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
        showNotifyToast('✅ Tin nhắn đã gửi về Telegram thành công!', 'success');
        playNotificationSound();
      } else {
        showNotifyToast('❌ Gửi thất bại! Vui lòng kiểm tra lại Token hoặc Chat ID.', 'error');
      }
    } catch (e) {
      showNotifyToast('❌ Lỗi kết nối mạng đến Telegram!', 'error');
    }
  });

  renderNotifyBadge();
  renderNotifyList();
}

document.addEventListener('DOMContentLoaded', initNotificationUI);

window.playNotificationSound = playNotificationSound;
window.requestBrowserNotify = requestBrowserNotify;
window.sendBrowserNotification = sendBrowserNotification;
window.notifyNewOrder = notifyNewOrder;
window.notifyNewUser = notifyNewUser;
