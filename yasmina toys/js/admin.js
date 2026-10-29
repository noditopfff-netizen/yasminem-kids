// Yasminem Kids - Admin Panel Skripti
document.addEventListener("DOMContentLoaded", () => {
  // To'g'ri login va parol
  const ADMIN_USER = "eshmamatovakamola";
  const ADMIN_PASS = "kamola1234";

  // Elementlar
  const loginSection = document.getElementById("login-section");
  const adminDashboard = document.getElementById("admin-dashboard");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const logoutBtn = document.getElementById("admin-logout-btn");

  const settingsForm = document.getElementById("settings-form");
  const settingPhone = document.getElementById("setting-phone");
  const settingTelegram = document.getElementById("setting-telegram");
  const settingFirebase = document.getElementById("setting-firebase");
  const downloadProductsBtn = document.getElementById("download-products-btn");

  const adminProductsTable = document.getElementById("admin-products-table");
  const openAddProductBtn = document.getElementById("open-add-product-btn");
  const productModal = document.getElementById("product-modal");
  const closeProductModalBtn = document.getElementById("close-product-modal-btn");
  const productForm = document.getElementById("product-form");
  const productModalTitle = document.getElementById("product-modal-title");

  const formProductId = document.getElementById("form-product-id");
  const formProductName = document.getElementById("form-product-name");
  const formProductCategory = document.getElementById("form-product-category");
  const formProductPrice = document.getElementById("form-product-price");
  const formProductImage = document.getElementById("form-product-image");
  const formProductFile = document.getElementById("form-product-file");
  const formProductDescription = document.getElementById("form-product-description");
  const imagePreviewContainer = document.getElementById("image-preview-container");
  const imagePreview = document.getElementById("image-preview");

  // Narx formati helper
  function formatPrice(num) {
    if (!num) return "0 so'm";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
  }

  // Toast
  function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-item px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border ${
      type === "success" 
        ? "bg-white text-emerald-800 border-emerald-200" 
        : "bg-white text-rose-800 border-rose-200"
    }`;

    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" class="w-4 h-4 text-emerald-600"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Firebase bulutiga mahsulotlarni sinxronizatsiya
  async function syncToFirebase(products) {
    const s = getStoreSettings();
    const firebaseUrl = s.firebaseUrl || DEFAULT_SETTINGS.firebaseUrl;
    if (firebaseUrl && firebaseUrl.trim()) {
      try {
        let url = firebaseUrl.trim();
        if (!url.endsWith("/")) url += "/";
        if (!url.includes(".json")) url += "products.json";
        await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(products)
        });
        showToast("Mahsulotlar Google bazasiga saqlandi! ☁️", "success");
        return true;
      } catch (e) {
        console.error("Firebase sync xatosi:", e);
      }
    }
    return false;
  }

  // Firebase bulutiga sozlamalarni (telefon, telegram) sinxronizatsiya
  async function syncSettingsToFirebase(settings) {
    const firebaseUrl = settings.firebaseUrl || DEFAULT_SETTINGS.firebaseUrl;
    if (firebaseUrl && firebaseUrl.trim()) {
      try {
        let url = firebaseUrl.trim();
        if (!url.endsWith("/")) url += "/";
        url += "settings.json";
        await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings)
        });
        showToast("Sozlamalar Google bulutiga saqlandi! ☁️", "success");
        return true;
      } catch (e) {
        console.error("Firebase settings sync xatosi:", e);
      }
    }
    return false;
  }

  // 1. Auth tekshirish
  async function checkAuth() {
    const isAuth = sessionStorage.getItem("yasminaxon_admin_auth") === "true";
    if (isAuth) {
      loginSection.classList.add("hidden");
      adminDashboard.classList.remove("hidden");
      await loadSettings();
      renderAdminProducts();
      // Bulutli bazadan oxirgi mahsulotlarni yuklash
      try {
        const cloud = await fetchStoreProductsAsync();
        if (cloud && cloud.length > 0) {
          renderAdminProducts();
        }
      } catch (e) {}
    } else {
      loginSection.classList.remove("hidden");
      adminDashboard.classList.add("hidden");
    }
    if (window.lucide) window.lucide.createIcons();
  }

  // Kirish formasi
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const login = document.getElementById("admin-login").value.trim();
      const pass = document.getElementById("admin-password").value.trim();

      if (login === ADMIN_USER && pass === ADMIN_PASS) {
        sessionStorage.setItem("yasminaxon_admin_auth", "true");
        loginError.classList.add("hidden");
        checkAuth();
        showToast("Tizimga muvaffaqiyatli kirdingiz! 👋", "success");
      } else {
        loginError.classList.remove("hidden");
      }
    });
  }

  // Chiqish
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("yasminaxon_admin_auth");
      checkAuth();
      showToast("Tizimdan chiqdingiz", "info");
    });
  }

  // 2. Sozlamalarni yuklash va saqlash
  async function loadSettings() {
    let s = getStoreSettings();
    try {
      const cloud = await fetchStoreSettingsAsync();
      if (cloud) s = cloud;
    } catch(e) {}
    if (settingTelegram) settingTelegram.value = s.telegram || "Yasminemkidss";
    if (settingFirebase) settingFirebase.value = s.firebaseUrl || DEFAULT_SETTINGS.firebaseUrl;
  }

  if (settingsForm) {
    settingsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const s = getStoreSettings();
      delete s.phone;
      s.telegram = settingTelegram.value.trim().replace(/^@/, '');
      s.firebaseUrl = (settingFirebase && settingFirebase.value.trim()) ? settingFirebase.value.trim() : DEFAULT_SETTINGS.firebaseUrl;
      saveStoreSettings(s);
      
      // Google Firebase bulutiga sozlamalarni saqlash
      await syncSettingsToFirebase(s);

      // Agar mahsulotlar ham bo'lsa, ularni ham sinxronlash
      const products = getStoreProducts();
      await syncToFirebase(products);

      showToast("Sozlamalar saqlandi va barcha klientlarda yangilandi! 🎉", "success");
    });
  }

  // 3. Mahsulotlar jadvalini chiqarish
  function renderAdminProducts() {
    if (!adminProductsTable) return;
    const products = getStoreProducts();

    if (products.length === 0) {
      adminProductsTable.innerHTML = `
        <tr>
          <td colspan="6" class="py-8 text-center text-slate-400 font-semibold">
            Hozircha hech qanday kiyim qo'shilmagan. Yuqoridagi "Yangi Kiyim Qo'shish" tugmasini bosing.
          </td>
        </tr>
      `;
      return;
    }

    adminProductsTable.innerHTML = products.map(item => `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3 px-3">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/logo.jpg'" class="w-12 h-14 object-cover rounded-xl border border-slate-200">
        </td>
        <td class="py-3 px-3 font-bold text-slate-800 max-w-[180px]">
          <div class="truncate">${item.name}</div>
        </td>
        <td class="py-3 px-3">
          <span class="px-2.5 py-1 bg-pink-50 text-pink-700 font-bold rounded-full text-[11px]">
            ${item.categoryName || item.category}
          </span>
        </td>
        <td class="py-3 px-3 font-extrabold text-pink-700 whitespace-nowrap">
          ${formatPrice(item.price)}
        </td>
        <td class="py-3 px-3 text-slate-500 max-w-[220px]">
          <div class="line-clamp-2">${item.description || ''}</div>
        </td>
        <td class="py-3 px-3 text-right whitespace-nowrap">
          <button onclick="editProduct(${item.id})" class="p-2 text-slate-500 hover:text-pink-600 rounded-lg hover:bg-white transition" title="Tahrirlash">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button onclick="deleteProduct(${item.id})" class="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition" title="O'chirish">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  // 4. Mahsulot qo'shish / tahrirlash
  if (openAddProductBtn) {
    openAddProductBtn.addEventListener("click", () => {
      formProductId.value = "";
      productForm.reset();
      productModalTitle.innerText = "Yangi Kiyim Qo'shish";
      imagePreviewContainer.classList.add("hidden");
      productModal.classList.add("active");
    });
  }

  if (closeProductModalBtn) {
    closeProductModalBtn.addEventListener("click", () => {
      productModal.classList.remove("active");
    });
  }

  // Rasm fayli yuklanganda Base64 ga aylantirish
  if (formProductFile) {
    formProductFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          formProductImage.value = base64;
          imagePreview.src = base64;
          imagePreviewContainer.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Rasm URL kiritilganda preview
  if (formProductImage) {
    formProductImage.addEventListener("input", (e) => {
      if (e.target.value.trim()) {
        imagePreview.src = e.target.value.trim();
        imagePreviewContainer.classList.remove("hidden");
      } else {
        imagePreviewContainer.classList.add("hidden");
      }
    });
  }

  // Mahsulotni tahrirlash funksiyasi
  window.editProduct = function(productId) {
    const products = getStoreProducts();
    const item = products.find(p => p.id === productId);
    if (!item) return;

    formProductId.value = item.id;
    formProductName.value = item.name;
    formProductCategory.value = item.category;
    formProductPrice.value = item.price;
    formProductImage.value = item.image;
    formProductDescription.value = item.description || "";

    if (item.image) {
      imagePreview.src = item.image;
      imagePreviewContainer.classList.remove("hidden");
    }

    productModalTitle.innerText = "Kiyimni Tahrirlash";
    productModal.classList.add("active");
  };

  // Mahsulotni o'chirish funksiyasi
  window.deleteProduct = async function(productId) {
    if (confirm("Haqiqatan ham ushbu kiyimni o'chirmoqchimisiz?")) {
      let products = getStoreProducts();
      products = products.filter(p => p.id !== productId);
      saveStoreProducts(products);
      await syncToFirebase(products);
      renderAdminProducts();
      showToast("Kiyim o'chirildi", "info");
    }
  };

  // Forma yuborilganda (Qo'shish yoki Saqlash)
  if (productForm) {
    productForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      let products = getStoreProducts();
      const id = formProductId.value ? parseInt(formProductId.value) : Date.now();
      const name = formProductName.value.trim();
      const category = formProductCategory.value;
      const price = parseInt(formProductPrice.value) || 0;
      const image = formProductImage.value.trim() || 'assets/logo.jpg';
      const description = formProductDescription.value.trim();

      const catObj = DEFAULT_CATEGORIES.find(c => c.id === category);
      const categoryName = catObj ? catObj.name : "Kiyim";

      const existingIndex = products.findIndex(p => p.id === id);

      const productObj = {
        id,
        name,
        category,
        categoryName,
        price,
        image,
        description
      };

      if (existingIndex > -1) {
        products[existingIndex] = productObj;
        showToast("Kiyim ma'lumotlari yangilandi! ✨", "success");
      } else {
        products.unshift(productObj);
        showToast("Yangi kiyim qo'shildi! 👗", "success");
      }

      saveStoreProducts(products);
      await syncToFirebase(products);
      productModal.classList.remove("active");
      renderAdminProducts();
    });
  }

  // 5. products.js faylini yuklab olish
  if (downloadProductsBtn) {
    downloadProductsBtn.addEventListener("click", () => {
      const products = getStoreProducts();
      const settings = getStoreSettings();

      const fileContent = `// Yasminem Kids - Yangilangan Mahsulotlar Bazasi
const DEFAULT_SETTINGS = ${JSON.stringify(settings, null, 2)};

const DEFAULT_CATEGORIES = ${JSON.stringify(DEFAULT_CATEGORIES, null, 2)};

const INITIAL_CLOTHES = ${JSON.stringify(products, null, 2)};

// Sozlamalarni LocalStorage dan olish
function getStoreSettings() {
  const saved = localStorage.getItem("yasminaxon_settings");
  if (saved) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

function saveStoreSettings(settings) {
  localStorage.setItem("yasminaxon_settings", JSON.stringify(settings));
}

function getStoreProducts() {
  const saved = localStorage.getItem("yasminaxon_products");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return INITIAL_CLOTHES;
}

function saveStoreProducts(products) {
  localStorage.setItem("yasminaxon_products", JSON.stringify(products));
}

async function fetchStoreProductsAsync() {
  const s = getStoreSettings();
  const firebaseUrl = s.firebaseUrl || DEFAULT_SETTINGS.firebaseUrl;
  if (firebaseUrl && firebaseUrl.trim()) {
    try {
      let url = firebaseUrl.trim();
      if (!url.endsWith("/")) url += "/";
      if (!url.includes(".json")) url += "products.json";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          const list = Array.isArray(data) ? data.filter(Boolean) : Object.values(data);
          if (list.length > 0) {
            localStorage.setItem("yasminaxon_products", JSON.stringify(list));
            return list;
          }
        }
      }
    } catch (e) {
      console.warn("Bulutli bazadan yuklashda xatolik:", e);
    }
  }
  return getStoreProducts();
}

async function fetchStoreSettingsAsync() {
  const s = getStoreSettings();
  const firebaseUrl = s.firebaseUrl || DEFAULT_SETTINGS.firebaseUrl;
  if (firebaseUrl && firebaseUrl.trim()) {
    try {
      let url = firebaseUrl.trim();
      if (!url.endsWith("/")) url += "/";
      url += "settings.json";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          const merged = { ...DEFAULT_SETTINGS, ...data, firebaseUrl };
          localStorage.setItem("yasminaxon_settings", JSON.stringify(merged));
          return merged;
        }
      }
    } catch (e) {
      console.warn("Sozlamalarni bulutdan yuklashda xatolik:", e);
    }
  }
  return s;
}
`;

      const blob = new Blob([fileContent], { type: "text/javascript;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "products.js";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("products.js yuklab olindi!", "success");
    });
  }

  // Dastlabki ishga tushirish
  checkAuth();
});
