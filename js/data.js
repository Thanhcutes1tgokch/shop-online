const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Áo thun Unisex",
    category: "áo",
    price: 150000,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80&auto=format&fit=crop",
    description: "Áo thun cotton cao cấp, thoáng mát."
  },
  {
    id: 2,
    name: "Quần jean xanh",
    category: "quần",
    price: 350000,
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80&auto=format&fit=crop",
    description: "Quần jean xanh đậm, co giãn tốt."
  },
  {
    id: 3,
    name: "Giày thể thao",
    category: "giày",
    price: 550000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&auto=format&fit=crop",
    description: "Giày đế cao su, êm chân, bền bỉ."
  },
  {
    id: 4,
    name: "Túi xách da",
    category: "phụ kiện",
    price: 250000,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&auto=format&fit=crop",
    description: "Túi da cao cấp, sang trọng."
  },
  {
    id: 5,
    name: "Mũ lưỡi trai",
    category: "phụ kiện",
    price: 120000,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80&auto=format&fit=crop",
    description: "Mũ vải denim, unisex."
  },
  {
    id: 6,
    name: "Áo sơ mi trắng",
    category: "áo",
    price: 220000,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80&auto=format&fit=crop",
    description: "Áo sơ mi trắng tay dài, dễ phối đồ."
  },
  {
    id: 7,
    name: "Áo khoác denim",
    category: "áo",
    price: 780000,
    image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&q=80&auto=format&fit=crop",
    description: "Áo khoác jeans đậm, phong cách bụi bặm."
  },
  {
    id: 8,
    name: "Quần short nam",
    category: "quần",
    price: 280000,
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80&auto=format&fit=crop",
    description: "Quần short thoải mái, năng động."
  },
  {
    id: 9,
    name: "Váy dạ hội",
    category: "váy",
    price: 690000,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80&auto=format&fit=crop",
    description: "Váy dạ hội sang trọng, phù hợp tiệc tùng."
  },
  {
    id: 10,
    name: "Đồng hồ nam",
    category: "phụ kiện",
    price: 850000,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80&auto=format&fit=crop",
    description: "Đồng hồ mặt kính sang trọng, không thấm nước."
  },
  {
    id: 11,
    name: "Kính mát Aviator",
    category: "phụ kiện",
    price: 320000,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80&auto=format&fit=crop",
    description: "Kính mát cổ điển, chống tia UV."
  },
  {
    id: 12,
    name: "Giày loafer nữ",
    category: "giày",
    price: 650000,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80&auto=format&fit=crop",
    description: "Giày loafer da mềm, thanh lịch."
  },
  {
    id: 13,
    name: "Ba lô du lịch",
    category: "phụ kiện",
    price: 420000,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80&auto=format&fit=crop",
    description: "Ba lô chống nước, nhiều ngăn tiện lợi."
  },
  {
    id: 14,
    name: "Hoodie unisex",
    category: "áo",
    price: 380000,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80&auto=format&fit=crop",
    description: "Hoodie dày dặn, ấm áp, dáng unisex."
  },
  {
    id: 15,
    name: "Áo blazer công sở",
    category: "áo",
    price: 950000,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80&auto=format&fit=crop",
    description: "Blazer lịch thiệp, chất liệu cao cấp."
  },
  {
    id: 16,
    name: "Áo len cổ lọ",
    category: "áo",
    price: 290000,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80&auto=format&fit=crop",
    description: "Áo len ấm áp, dễ phối đồ mùa đông."
  },
  {
    id: 17,
    name: "Túi đeo chéo",
    category: "phụ kiện",
    price: 340000,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80&auto=format&fit=crop",
    description: "Túi đeo chéo nhỏ gọn, phong cách."
  },
  {
    id: 18,
    name: "Kính thời trang",
    category: "phụ kiện",
    price: 260000,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80&auto=format&fit=crop",
    description: "Kính thời trang hiện đại, nhẹ nhàng."
  }
];

let PRODUCTS = [];

/* ---------- Hợp nhất sản phẩm từ trang Admin (localStorage) ---------- */
(function mergeCustomProducts() {
  let hidden = [];
  let customs = [];
  try { hidden = JSON.parse(localStorage.getItem('shopHiddenIds')) || []; } catch (e) { hidden = []; }
  try { customs = JSON.parse(localStorage.getItem('customProducts')) || []; } catch (e) { customs = []; }

  hidden = hidden.map(String);
  const map = {};
  DEFAULT_PRODUCTS.forEach(p => { map[p.id] = Object.assign({}, p); });
  customs.forEach(p => { if (p && p.id) map[p.id] = Object.assign({}, p); });

  PRODUCTS = Object.values(map).filter(p => hidden.indexOf(String(p.id)) === -1);
})();