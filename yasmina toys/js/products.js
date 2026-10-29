// Yasminem Kids - Dastlabki Ma'lumotlar va Sozlamalar

const DEFAULT_SETTINGS = {
  phone: "+998930688035",
  telegram: "yasminem_kids",
  shopName: "Yasminem Kids",
  address: "Toshkent shahri, Chilonzor tumani",
  workHours: "09:00 - 20:00 (Har kuni)",
  firebaseUrl: "" // Ixtiyoriy: agar Google Firebase Realtime Database URL kiritilsa, barcha klientlarda darhol ko'rinadi
};

const DEFAULT_CATEGORIES = [
  { id: "all", name: "Barcha kiyimlar", icon: "sparkles" },
  { id: "dresses", name: "Ko'ylaklar", icon: "shirt" },
  { id: "kids", name: "Bolalar kiyimlari", icon: "baby" },
  { id: "sets", name: "Kostyum & To'plamlar", icon: "layers" },
  { id: "seasonal", name: "Mavsumiy kiyimlar", icon: "cloud-sun" },
  { id: "casual", name: "Kundalik kiyimlar", icon: "smile" }
];

const INITIAL_CLOTHES = [
  {
    id: 1,
    name: "Zardo'zi Bezakli Qizaloqlar Ko'ylagi",
    category: "dresses",
    categoryName: "Ko'ylaklar",
    price: 240000,
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80",
    description: "Bayramlar va to'ylar uchun mo'ljallangan nafis qizlar ko'ylagi. Mayin paxta astarli, teriga botmaydi, juda bejirim va zamonaviy bichim."
  },
  {
    id: 2,
    name: "Bolalar uchun Qulay Sport To'plami (Ikki qismli)",
    category: "kids",
    categoryName: "Bolalar kiyimlari",
    price: 185000,
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80",
    description: "100% tabiiy paxtadan (trikotaj) tayyorlangan qulay kundalik sport kiyimi. Ranglari yuvilganda o'chmaydi, harakatlanish uchun juda qulay."
  },
  {
    id: 3,
    name: "Klassik Bejirim Bolalar Kostyum-Shimi",
    category: "sets",
    categoryName: "Kostyum & To'plamlar",
    price: 320000,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
    description: "Kichik jentlmenlar uchun zamonaviy bichimdagi tantanali kostyum. Yuqori sifatli mato, sifatli furnitura va nafis ko'rinish."
  },
  {
    id: 4,
    name: "Iliq Kuz-Qish Nimchasi (Jiletka)",
    category: "seasonal",
    categoryName: "Mavsumiy kiyimlar",
    price: 195000,
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
    description: "Shamol va sovuqdan himoya qiluvchi engil va iliq nimcha. Suv o'tkazmaydigan tashqi mato va qulay fermuarlar bilan jihozlangan."
  },
  {
    id: 5,
    name: "Gulli Yozgi Paxtali Ko'ylak",
    category: "dresses",
    categoryName: "Ko'ylaklar",
    price: 145000,
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=600&q=80",
    description: "Issiq kunlar uchun yengil va havo o'tkazuvchan tabiiy shtapel matoli yozgi libos. Yorqin gulli print va nozik belbog'li."
  },
  {
    id: 6,
    name: "Yumshoq Trikotaj Sviter va Shim Jamlanmasi",
    category: "casual",
    categoryName: "Kundalik kiyimlar",
    price: 210000,
    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80",
    description: "Uyda va sayrda kiyish uchun mo'ljallangan yoqimli va issiq trikotaj komplekt. Kichkintoylar uchun erkin va qulay bichim."
  }
];

// Sozlamalarni LocalStorage dan olish yoki standartini yuklash
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

// Mahsulotlarni LocalStorage dan olish
function getStoreProducts() {
  const saved = localStorage.getItem("yasminaxon_products");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error("Xatolik mahsulotlarni o'qishda:", e);
    }
  }
  // Agar hali saqlanmagan bo'lsa, dastlabkilarini yozib qo'yamiz
  localStorage.setItem("yasminaxon_products", JSON.stringify(INITIAL_CLOTHES));
  return INITIAL_CLOTHES;
}

function saveStoreProducts(products) {
  localStorage.setItem("yasminaxon_products", JSON.stringify(products));
}

// Bulutli bazadan (agar Firebase URL sozlangan bo'lsa) mahsulotlarni yuklash
async function fetchStoreProductsAsync() {
  const s = getStoreSettings();
  if (s.firebaseUrl && s.firebaseUrl.trim()) {
    try {
      let url = s.firebaseUrl.trim();
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
