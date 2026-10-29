// Yasminem Kids - Asosiy Ilova Skripti
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Ma'lumotlarni yuklash
  const settings = getStoreSettings();
  let products = getStoreProducts();
  let currentCategory = "all";
  let searchQuery = "";

  // 2. Elementlar
  const productsContainer = document.getElementById("products-container");
  const categoriesContainer = document.getElementById("categories-container");
  const searchInput = document.getElementById("search-input");
  const mobileSearchInput = document.getElementById("mobile-search-input");
  const productsCountEl = document.getElementById("products-count");

  // Aloqa elementlari (telefon va telegram)
  function applyStoreSettings() {
    const s = getStoreSettings();

    // Telefon raqamlar
    document.querySelectorAll(".store-phone-text").forEach(el => el.innerText = s.phone);
    document.querySelectorAll(".store-phone-link").forEach(el => el.href = `tel:${s.phone.replace(/\s+/g, '')}`);

    // Telegram havolalar
    const cleanTg = s.telegram.replace(/^@/, '');
    document.querySelectorAll(".store-tg-text").forEach(el => el.innerText = `@${cleanTg}`);
    document.querySelectorAll(".store-tg-link").forEach(el => el.href = `https://t.me/${cleanTg}`);
  }

  applyStoreSettings();

  // Narxni formatlash helperi (240000 -> 240 000 so'm)
  function formatPrice(num) {
    if (!num) return "0 so'm";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
  }

  // 3. Kategoriyalarni render qilish
  function renderCategories() {
    if (!categoriesContainer) return;

    categoriesContainer.innerHTML = DEFAULT_CATEGORIES.map(cat => {
      const isActive = cat.id === currentCategory;
      return `
        <button 
          data-category="${cat.id}"
          class="category-pill flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold border border-slate-200 bg-white text-slate-700 whitespace-nowrap transition-all shadow-sm hover:border-pink-300 hover:text-pink-600 ${isActive ? 'active' : ''}"
        >
          <i data-lucide="${cat.icon}" class="w-4 h-4"></i>
          <span>${cat.name}</span>
        </button>
      `;
    }).join("");

    categoriesContainer.querySelectorAll(".category-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        currentCategory = btn.getAttribute("data-category");
        renderCategories();
        renderProducts();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // 4. Mahsulotlarni (Kiyimlarni) render qilish
  function renderProducts() {
    if (!productsContainer) return;

    const filtered = products.filter(p => {
      const matchCategory = currentCategory === "all" || p.category === currentCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });

    if (productsCountEl) {
      productsCountEl.innerText = `${filtered.length} ta kiyim mavjud`;
    }

    if (filtered.length === 0) {
      productsContainer.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <div class="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            👗
          </div>
          <h3 class="text-lg font-bold text-slate-800">Ushbu toifada kiyimlar topilmadi</h3>
          <p class="text-xs text-slate-500 mt-1">Boshqa bo'limni tanlang yoki qidiruv so'zini tozalang.</p>
        </div>
      `;
      return;
    }

    productsContainer.innerHTML = filtered.map(item => `
      <div class="clothing-card bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col group">
        <!-- Rasm qismi -->
        <div class="clothing-img-container aspect-[4/5] bg-slate-50 relative flex items-center justify-center">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover" loading="lazy" onerror="this.src='assets/logo.jpg'">
          
          <div class="absolute top-3 left-3">
            <span class="bg-white/95 backdrop-blur-md text-pink-700 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm border border-pink-100">
              ${item.categoryName || 'Kiyim'}
            </span>
          </div>

          <!-- Batafsil tugmasi (hoverda) -->
          <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
            <button 
              onclick="openProductModal(${item.id})"
              class="px-5 py-2.5 bg-white text-slate-800 rounded-full font-bold text-xs shadow-lg hover:bg-slate-50 transition transform translate-y-2 group-hover:translate-y-0"
            >
              Batafsil ko'rish
            </button>
          </div>
        </div>

        <!-- Ma'lumot qismi (faqat Narxi, Nomi va Tavsifi) -->
        <div class="p-5 flex flex-col flex-1">
          <h3 class="font-bold text-slate-800 text-base line-clamp-1 mb-1.5 group-hover:text-pink-600 transition" title="${item.name}">
            ${item.name}
          </h3>

          <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            ${item.description || ''}
          </p>

          <!-- Narx va Sotib olish -->
          <div class="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              <span class="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Narxi</span>
              <span class="text-lg font-extrabold text-pink-700 leading-tight">
                ${formatPrice(item.price)}
              </span>
            </div>

            <button 
              onclick="openOrderModal(${item.id})" 
              class="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white rounded-2xl flex items-center gap-1.5 font-bold text-xs transition shadow-md shadow-pink-600/20"
            >
              <i data-lucide="send" class="w-3.5 h-3.5"></i>
              <span>Sotib olish</span>
            </button>
          </div>
        </div>
      </div>
    `).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  // 5. Sotib olish / Buyurtma berish Modali
  window.openOrderModal = function(productId) {
    const s = getStoreSettings();
    const item = products.find(p => p.id === productId);
    if (!item) return;

    const modal = document.getElementById("order-modal");
    const content = document.getElementById("order-modal-content");
    const cleanTg = s.telegram.replace(/^@/, '');
    const cleanPhone = s.phone.replace(/\s+/g, '');

    const tgMessage = encodeURIComponent(`Assalomu alaykum! Men "Yasminem Kids" do'konidan "${item.name}" kiyimini sotib olmoqchiman.\nNarxi: ${formatPrice(item.price)}.\nBatafsil ma'lumot bera olasizmi?`);
    const tgUrl = `https://t.me/${cleanTg}?text=${tgMessage}`;

    content.innerHTML = `
      <div class="text-center">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/logo.jpg'" class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover mx-auto mb-3 border-2 border-pink-100 shadow-md">
        
        <span class="text-[11px] font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-0.5 rounded-full">
          ${item.categoryName || 'Kiyim'}
        </span>
        
        <h3 class="font-bold text-base sm:text-lg text-slate-900 mt-2">${item.name}</h3>
        <p class="text-xl font-extrabold text-pink-700 mt-1 mb-4">${formatPrice(item.price)}</p>

        <p class="text-xs text-slate-500 leading-relaxed mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          Ushbu mahsulotni to'g'ridan-to'g'ri do'kon admini orqali xarid qilishingiz mumkin. Quyidagi qulay usulni tanlang:
        </p>

        <div class="space-y-3">
          <!-- Telegram orqali xarid -->
          <a 
            href="${tgUrl}" 
            target="_blank" 
            class="w-full py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition active:scale-95"
          >
            <i data-lucide="send" class="w-4 h-4"></i>
            <span>Telegram orqali yozish (@${cleanTg})</span>
          </a>

          <!-- Telefon orqali xarid -->
          <a 
            href="tel:${cleanPhone}" 
            class="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition active:scale-95"
          >
            <i data-lucide="phone-call" class="w-4 h-4"></i>
            <span>Qo'ng'iroq qilish (${s.phone})</span>
          </a>
        </div>
      </div>
    `;

    modal.classList.add("active");
    if (window.lucide) window.lucide.createIcons();
  };

  window.closeOrderModal = function() {
    const modal = document.getElementById("order-modal");
    if (modal) modal.classList.remove("active");
  };

  // 6. Mahsulotni batafsil ko'rish (Quick View Modal)
  window.openProductModal = function(productId) {
    const s = getStoreSettings();
    const item = products.find(p => p.id === productId);
    if (!item) return;

    const modal = document.getElementById("product-modal");
    const content = document.getElementById("product-modal-content");
    const cleanTg = s.telegram.replace(/^@/, '');
    const cleanPhone = s.phone.replace(/\s+/g, '');

    const tgMessage = encodeURIComponent(`Assalomu alaykum! Men "${item.name}" kiyimi haqida ma'lumot olmoqchiman. Narxi: ${formatPrice(item.price)}`);
    const tgUrl = `https://t.me/${cleanTg}?text=${tgMessage}`;

    content.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div class="rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 aspect-[4/5] flex items-center justify-center">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/logo.jpg'" class="w-full h-full object-cover">
        </div>
        
        <div class="flex flex-col">
          <span class="text-xs font-bold text-pink-600 uppercase tracking-wider mb-2">
            ${item.categoryName || 'Kiyim'}
          </span>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 mb-2">${item.name}</h2>
          
          <div class="text-2xl font-extrabold text-pink-700 mb-4">
            ${formatPrice(item.price)}
          </div>

          <div class="mb-6">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tavsifi:</h4>
            <p class="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              ${item.description || "Mahsulot bo'yicha batafsil ma'lumot olish uchun bog'laning."}
            </p>
          </div>

          <div class="space-y-2.5">
            <a 
              href="${tgUrl}" 
              target="_blank" 
              class="w-full py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95"
            >
              <i data-lucide="send" class="w-4 h-4"></i>
              <span>Telegramda buyurtma berish</span>
            </a>

            <a 
              href="tel:${cleanPhone}" 
              class="w-full py-3.5 px-4 rounded-2xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95"
            >
              <i data-lucide="phone-call" class="w-4 h-4"></i>
              <span>Qo'ng'iroq qilish: ${s.phone}</span>
            </a>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("active");
    if (window.lucide) window.lucide.createIcons();
  };

  window.closeProductModal = function() {
    const modal = document.getElementById("product-modal");
    if (modal) modal.classList.remove("active");
  };

  // Modal foniga bosilganda yopish
  const orderModal = document.getElementById("order-modal");
  if (orderModal) {
    orderModal.addEventListener("click", (e) => {
      if (e.target === orderModal) closeOrderModal();
    });
  }

  const productModal = document.getElementById("product-modal");
  if (productModal) {
    productModal.addEventListener("click", (e) => {
      if (e.target === productModal) closeProductModal();
    });
  }

  // 7. Qidiruv qutisi
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  // Dastlabki render
  renderCategories();
  renderProducts();

  // Agar Firebase bulutli baza sozlangan bo'lsa, real vaqtda yuklab olamiz
  try {
    const cloudProducts = await fetchStoreProductsAsync();
    if (cloudProducts && cloudProducts.length > 0) {
      products = cloudProducts;
      renderProducts();
    }
  } catch (e) {
    console.log("Offline or local mode");
  }
});
