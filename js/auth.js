/**
 * ShopOnline Authentication System
 * - Đăng ký tài khoản (Họ tên, SĐT, Email, Mật khẩu)
 * - Đăng nhập / Đăng xuất
 * - Lưu phiên đăng nhập vào LocalStorage
 * - Tự động điền thông tin vào trang Thanh toán
 * - Gửi thông báo người dùng mới về Telegram của chủ shop
 */

'use strict';

let currentUser = null;
try {
  currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
} catch (e) {
  currentUser = null;
}

// Lấy danh sách users
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('shopUsers')) || [];
  } catch (e) {
    return [];
  }
}

// Lưu danh sách users
function saveUsers(users) {
  localStorage.setItem('shopUsers', JSON.stringify(users));
}

// Cập nhật giao diện Header (nút Đăng nhập hoặc Tên User)
function renderUserHeader() {
  const wrapper = document.getElementById('userMenuWrapper');
  if (!wrapper) return;

  if (currentUser) {
    const firstLetter = (currentUser.name || 'U').charAt(0).toUpperCase();
    wrapper.innerHTML = `
      <div class="user-profile-badge" id="userProfileBadge">
        <div class="user-avatar">${firstLetter}</div>
        <span class="user-name">${currentUser.name}</span>
        <i class="fas fa-chevron-down" style="font-size:11px;"></i>
        <div class="user-dropdown-menu" id="userDropdownMenu">
          <div class="user-dropdown-info">
            <b>${currentUser.name}</b>
            <small>${currentUser.email || currentUser.phone}</small>
          </div>
          <a href="orders.html"><i class="fas fa-box-open"></i> Đơn hàng của tôi</a>
          <button id="logoutBtn" type="button"><i class="fas fa-sign-out-alt"></i> Đăng xuất</button>
        </div>
      </div>
    `;

    // Dropdown toggle
    const badge = document.getElementById('userProfileBadge');
    const menu = document.getElementById('userDropdownMenu');
    if (badge && menu) {
      badge.addEventListener('click', e => {
        e.stopPropagation();
        menu.classList.toggle('active');
      });
      document.addEventListener('click', e => {
        if (!badge.contains(e.target)) menu.classList.remove('active');
      });
    }

    // Đăng xuất
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      logout();
    });
  } else {
    wrapper.innerHTML = `
      <button class="btn-auth-open" id="openAuthBtn" type="button">
        <i class="fas fa-user-circle"></i>
        <span>Đăng nhập</span>
      </button>
    `;

    document.getElementById('openAuthBtn')?.addEventListener('click', () => {
      openAuthModal('login');
    });
  }
}

// Tự động điền thông tin vào form thanh toán checkout.html nếu đã đăng nhập
function autofillCheckout() {
  if (!currentUser) return;
  const nameInput = document.getElementById('cName');
  const phoneInput = document.getElementById('cPhone');
  const emailInput = document.getElementById('cEmail');
  if (nameInput && !nameInput.value) nameInput.value = currentUser.name || '';
  if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.phone || '';
  if (emailInput && !emailInput.value) emailInput.value = currentUser.email || '';
}

// Mở Modal Đăng ký / Đăng nhập
function openAuthModal(tab = 'login') {
  const modal = document.getElementById('authModalOverlay');
  if (!modal) return;
  switchAuthTab(tab);
  modal.classList.add('active');
}

function closeAuthModal() {
  const modal = document.getElementById('authModalOverlay');
  if (modal) modal.classList.remove('active');
}

function switchAuthTab(tab) {
  const tabLogin = document.getElementById('tabLoginBtn');
  const tabReg = document.getElementById('tabRegisterBtn');
  const formLogin = document.getElementById('loginForm');
  const formReg = document.getElementById('registerForm');
  if (!tabLogin || !tabReg || !formLogin || !formReg) return;

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
    formLogin.style.display = 'block';
    formReg.style.display = 'none';
  } else {
    tabReg.classList.add('active');
    tabLogin.classList.remove('active');
    formLogin.style.display = 'none';
    formReg.style.display = 'block';
  }
}

// Xử lý Đăng ký
function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value;

  if (!name || !phone || !pass) {
    showToastMsg('⚠️ Vui lòng điền đủ họ tên, số điện thoại và mật khẩu', 'error');
    return;
  }
  if (!/^\d{9,12}$/.test(phone.replace(/[\s.-]/g, ''))) {
    showToastMsg('⚠️ Số điện thoại không hợp lệ', 'error');
    return;
  }
  if (pass.length < 6) {
    showToastMsg('⚠️ Mật khẩu phải có ít nhất 6 ký tự', 'error');
    return;
  }

  const users = getUsers();
  const existPhone = users.find(u => u.phone === phone);
  if (existPhone) {
    showToastMsg('⚠️ Số điện thoại này đã được đăng ký trước đó!', 'error');
    return;
  }
  if (email) {
    const existEmail = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (existEmail) {
      showToastMsg('⚠️ Email này đã được đăng ký!', 'error');
      return;
    }
  }

  const newUser = {
    id: 'user_' + Date.now(),
    name,
    phone,
    email,
    password: pass,
    createdAt: new Date().toLocaleString('vi-VN')
  };

  users.push(newUser);
  saveUsers(users);

  // Đăng nhập luôn
  currentUser = newUser;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  renderUserHeader();
  autofillCheckout();
  closeAuthModal();
  showToastMsg(`🎉 Chào mừng bạn, ${newUser.name}! Đăng ký thành công.`, 'success');

  // Gửi thông báo về Telegram & hệ thống
  if (typeof window.notifyNewUser === 'function') {
    window.notifyNewUser(newUser);
  }
}

// Xử lý Đăng nhập
function handleLogin(e) {
  e.preventDefault();
  const account = document.getElementById('loginAccount').value.trim();
  const pass = document.getElementById('loginPass').value;

  if (!account || !pass) {
    showToastMsg('⚠️ Vui lòng nhập tài khoản và mật khẩu', 'error');
    return;
  }

  const users = getUsers();
  const matched = users.find(u =>
    (u.phone === account || (u.email && u.email.toLowerCase() === account.toLowerCase())) &&
    u.password === pass
  );

  if (!matched) {
    showToastMsg('❌ Tài khoản hoặc mật khẩu không chính xác!', 'error');
    return;
  }

  currentUser = matched;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  renderUserHeader();
  autofillCheckout();
  closeAuthModal();
  showToastMsg(`👋 Chào mừng bạn quay lại, ${currentUser.name}!`, 'success');
}

// Đăng xuất
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  renderUserHeader();
  showToastMsg('👋 Bạn đã đăng xuất thành công.', 'info');
}

function showToastMsg(msg, type = 'info') {
  if (typeof window.showToast === 'function') {
    window.showToast(msg, type);
  } else {
    alert(msg);
  }
}

// Tiêm giao diện Auth Modal vào trang HTML
function injectAuthModal() {
  if (document.getElementById('authModalOverlay')) return;

  const modalHtml = `
    <div class="auth-modal-overlay" id="authModalOverlay">
      <div class="auth-modal">
        <button class="auth-close-btn" id="closeAuthBtn">&times;</button>
        <div class="auth-tabs">
          <button class="auth-tab active" id="tabLoginBtn" type="button">Đăng nhập</button>
          <button class="auth-tab" id="tabRegisterBtn" type="button">Đăng ký</button>
        </div>

        <!-- FORM ĐĂNG NHẬP -->
        <form class="auth-form" id="loginForm">
          <div class="auth-group">
            <label>Số điện thoại hoặc Email</label>
            <div class="auth-input-icon">
              <i class="fas fa-user"></i>
              <input type="text" id="loginAccount" placeholder="Nhập SĐT hoặc email" required autocomplete="username">
            </div>
          </div>
          <div class="auth-group">
            <label>Mật khẩu</label>
            <div class="auth-input-icon">
              <i class="fas fa-lock"></i>
              <input type="password" id="loginPass" placeholder="Nhập mật khẩu" required autocomplete="current-password">
              <button type="button" class="toggle-pass" onclick="togglePass('loginPass', this)"><i class="fas fa-eye"></i></button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-full" style="margin-top:15px;">
            <i class="fas fa-sign-in-alt"></i> Đăng nhập
          </button>
          <div class="auth-switch-text">
            Chưa có tài khoản? <a href="#" id="switchToRegister">Đăng ký ngay</a>
          </div>
        </form>

        <!-- FORM ĐĂNG KÝ -->
        <form class="auth-form" id="registerForm" style="display:none;">
          <div class="auth-group">
            <label>Họ và tên <span class="req">*</span></label>
            <div class="auth-input-icon">
              <i class="fas fa-id-card"></i>
              <input type="text" id="regName" placeholder="Nguyễn Văn A" required>
            </div>
          </div>
          <div class="auth-group">
            <label>Số điện thoại <span class="req">*</span></label>
            <div class="auth-input-icon">
              <i class="fas fa-phone-alt"></i>
              <input type="tel" id="regPhone" placeholder="0912 345 678" required>
            </div>
          </div>
          <div class="auth-group">
            <label>Email (tùy chọn)</label>
            <div class="auth-input-icon">
              <i class="fas fa-envelope"></i>
              <input type="email" id="regEmail" placeholder="email@example.com">
            </div>
          </div>
          <div class="auth-group">
            <label>Mật khẩu (ít nhất 6 ký tự) <span class="req">*</span></label>
            <div class="auth-input-icon">
              <i class="fas fa-lock"></i>
              <input type="password" id="regPass" placeholder="Nhập mật khẩu bí mật" required minlength="6">
              <button type="button" class="toggle-pass" onclick="togglePass('regPass', this)"><i class="fas fa-eye"></i></button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-full" style="margin-top:15px;">
            <i class="fas fa-user-plus"></i> Tạo tài khoản mới
          </button>
          <div class="auth-switch-text">
            Đã có tài khoản? <a href="#" id="switchToLogin">Đăng nhập</a>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Sự kiện
  document.getElementById('tabLoginBtn')?.addEventListener('click', () => switchAuthTab('login'));
  document.getElementById('tabRegisterBtn')?.addEventListener('click', () => switchAuthTab('register'));
  document.getElementById('switchToRegister')?.addEventListener('click', e => { e.preventDefault(); switchAuthTab('register'); });
  document.getElementById('switchToLogin')?.addEventListener('click', e => { e.preventDefault(); switchAuthTab('login'); });
  document.getElementById('closeAuthBtn')?.addEventListener('click', closeAuthModal);

  document.getElementById('authModalOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) closeAuthModal();
  });

  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
}

// Ẩn hiện mật khẩu
window.togglePass = function(id, btn) {
  const input = document.getElementById(id);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  const icon = btn.querySelector('i');
  if (icon) {
    icon.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
  }
};

document.addEventListener('DOMContentLoaded', function() {
  injectAuthModal();
  renderUserHeader();
  autofillCheckout();
});

window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
