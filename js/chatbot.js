(function () {
  'use strict';

  var FAQ = [
    { keys: ['chào', 'hello', 'hi', 'xin chào', 'alo'], reply: 'Xin chào! 🖐️ Em là trợ lý của ShopOnline. Anh/chị cần hỗ trợ gì ạ? (giá cả, vận chuyển, đổi trả...)', type: 'greet' },
    { keys: ['giá', 'bao nhiêu', 'tiền', 'cost', 'price'], reply: 'Giá sản phẩm dao động từ 120.000đ đến 550.000đ, tùy loại. Ưu đãi mùa hè đang giảm tới 50% cho áo thun nhé! 🎉', type: 'faq' },
    { keys: ['vận chuyển', 'giao hàng', 'ship', 'nhận hàng'], reply: '🚚 Miễn phí vận chuyển cho đơn từ 500.000đ. Đơn dưới ngưỡng phí 30.000đ, giao dự kiến 2–4 ngày toàn quốc ạ.', type: 'faq' },
    { keys: ['đổi trả', 'trả hàng', 'hoàn', 'bảo hành', 'đổi'], reply: '🔁 Hỗ trợ đổi trả trong 7 ngày nếu sản phẩm lỗi hoặc không đúng mô tả. Vui lòng giữ hóa đơn và bao bì gốc nhé!', type: 'faq' },
    { keys: ['thanh toán', 'trả tiền', 'chuyển khoản', 'cod', 'qr'], reply: '💳 ShopOnline chấp nhận: chuyển khoản ngân hàng, ví điện tử (MoMo, ZaloPay) và COD. Đặc biệt mùa hè còn áp dụng mã giảm thêm 10%.', type: 'faq' },
    { keys: ['liên hệ', 'hotline', 'email', 'sdt', 'số điện thoại', 'zalo', 'gmail', 'mail'], reply: '📞 Zalo: <a href="https://zalo.me/0705634177" target="_blank">0705634177</a> | Email: <a href="mailto:dtc235200687@ictu.edu.vn">dtc235200687@ictu.edu.vn</a>. Em phản hồi Zalo gần như ngay lập tức trong giờ làm việc nhé!', type: 'faq' },
    { keys: ['giờ', 'mở cửa', 'làm việc', 'thời gian'], reply: '🕗 ShopOnline phục vụ 8h00 – 20h00 tất cả các ngày, kể cả cuối tuần và lễ Tết ạ.', type: 'faq' },
    { keys: ['mua', 'đặt hàng', 'order', 'cách mua'], reply: '🛍️ Cách mua rất đơn giản: bấm "Thêm vào giỏ" ngay trên sản phẩm, hoặc vào trang chi tiết để chọn số lượng rồi thanh toán. Cần em hỗ trợ thêm gì không ạ?', type: 'faq' },
    { keys: ['áo', 'quần', 'giày', 'túi', 'mũ', 'sản phẩm'], reply: '👕 Shop có danh mục: Áo, Quần, Giày, Phụ kiện. Anh/chị bấm nút lọc "Tất cả / Áo / Quần..." ngay dưới tiêu đề "Sản phẩm nổi bật" để xem từng loại nhé!', type: 'faq' },
    { keys: ['khuyến mãi', 'giảm giá', 'sale', 'ưu đãi', 'coupon'], reply: '🎉 Ưu đãi mùa hè: giảm tới 50% áo thun, miễn phí vận chuyển đơn từ 500.000đ. Thêm sản phẩm vào giỏ để nhận ưu đãi ngay!', type: 'faq' },
    { keys: ['cảm ơn', 'cám ơn', 'thank'], reply: 'Dạ không có gì ạ! 😊 Cần gì thêm cứ gọi em nhé. Chúc anh/chị mua sắm vui vẻ!', type: 'bye' },
    { keys: ['tạm biệt', 'bye', 'goodbye', 'bai'], reply: 'Tạm biệt anh/chị! Hẹn gặp lại tại ShopOnline. 👋', type: 'bye' }
  ];

  var DEFAULT_REPLY = 'Em chưa hiểu câu này lắm. 🤔 Anh/chị thử chọn một trong các câu hỏi bên dưới, hoặc hỏi về: giá cả, vận chuyển, đổi trả, thanh toán, liên hệ nhé!';
  var WELCOME = 'Chào anh/chị! 👋 Em là trợ lý của ShopOnline. Anh/chị có thể hỏi em về giá sản phẩm, vận chuyển, đổi trả... 🛍️';

  var toggle = document.getElementById('chatbotToggle');
  var windowEl = document.getElementById('chatbotWindow');
  var body = document.getElementById('chatbotBody');
  var form = document.getElementById('chatbotForm');
  var input = document.getElementById('chatbotInput');
  var closeBtn = document.getElementById('chatbotClose');
  var opened = false;

  if (!toggle || !windowEl || !body) return;

  function findReply(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < FAQ.length; i++) {
      if (FAQ[i].keys.some(function (k) { return lower.indexOf(k) !== -1; })) {
        return FAQ[i].reply;
      }
    }
    return DEFAULT_REPLY;
  }

  function addMsg(text, who) {
    var div = document.createElement('div');
    div.className = 'msg ' + who;
    div.innerHTML = '<div class="bubble">' + text + '</div>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  function botSay(text, delay) {
    setTimeout(function () {
      var typing = addMsg('...', 'bot');
      typing.classList.add('typing');
      setTimeout(function () {
        typing.remove();
        addMsg(text, 'bot');
      }, 400);
    }, delay || 400);
  }

  function send(text) {
    if (!text.trim()) return;
    addMsg(text, 'user');
    input.value = '';
    botSay(findReply(text));
  }

  function openChat() {
    opened = true;
    windowEl.classList.add('open');
    toggle.style.display = 'none';
    if (!body.childNodes.length) {
      setTimeout(botSay, 300, WELCOME, 200);
    }
    input.focus();
  }

  function closeChat() {
    opened = false;
    windowEl.classList.remove('open');
    toggle.style.display = 'inline-flex';
  }

  toggle.addEventListener('click', openChat);
  if (closeBtn) closeBtn.addEventListener('click', closeChat);

  form && form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) send(input.value);
  });

  document.querySelectorAll('.chatbot-quick [data-q]').forEach(function (btn) {
    btn.addEventListener('click', function () { send(btn.dataset.q); });
  });
})();