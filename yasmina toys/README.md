# 🦄 Yasminem Kids - Bolalar Kiyimlari Katalogi va Admin Panel

Ushbu veb-sayt **"Yasminem Kids"** brendi uchun yaratilgan zamonaviy internet-do'kon katalogi va admin boshqaruv panelidir.

---

## 🎨 Brend Logotipi
- Rasmiy logotip: `assets/logo.jpg` (Pushti bir shoxli ot va "Yasminem Kids" yozuvi).
- Sayt sarlavhasi (Header), Hero banneri, Favicon va Admin panelda katta va chiroyli qilib joylashtirilgan.

---

## 🔐 Admin Panel Ma'lumotlari

Admin panelga kirish havolasi: **`admin.html`** (saytning yuqori o'ng burchagidagi va footer qismidagi 🔒 qulf belgisi orqali ham kirish mumkin).

- **Login:** `eshmamatovakamola`
- **Parol:** `kamola1234`

---

## ❓ Nega admin qo'shgan kiyim klientlarda darhol ko'rinmaydi?

Chunki Netlify bu **statik fayllar hostingi**. Siz o'z telefoningiz yoki kompyuteringizda yangi kiyim qo'shganingizda u sizning brauzeringiz xotirasida turadi. Boshqa odamlar (klientlar) saytga kirganda esa Netlify-dagi asl fayllarni yuklaydi.

### 🌟 Yangi kiyimlarni barcha klientlarga ko'rsatishning 2 ta oson yo'li:

#### 1-usul: "1-klikda yuklab olish va Netlify ga tashlash" (Hozirgi bepul usul)
1. `admin.html` ga kiring va yangi kiyimlar qo'shing yoki narxlarni o'zgartiring.
2. Sahifadagi **"📥 Yangi products.js faylini yuklab olish"** tugmasini bosing.
3. Yuklab olingan `products.js` faylini `yasmina toys/js/` papkasidagi eski `products.js` ustiga tashlang (almashtiring).
4. `yasmina toys` papkasini [app.netlify.com](https://app.netlify.com) ga yana bir bor tashlang (Drag & Drop).
5. **Bo'ldi!** Endi dunyoning istalgan joyidagi har bir klient yangi kiyimlarni ko'radi!

#### 2-usul: "Google Firebase Realtime Database" (Avtomatik bulutli baza)
- Agar Google Firebase Realtime Database ochib, uning havolasini `admin.html` sozlamalariga kiritsangiz:
- Siz qo'shgan yoki o'zgartirgan har bir kiyim **avtomatik ravishda bulutga** saqlanadi va Netlify-ga qayta yuklash shart bo'lmaydi — barcha klientlar telefonida o'sha soniyada ko'rinadi!

---

## 💡 Sayt Yaratish Xizmati (Reklama)
Agar sizga ham shunaqa zamonaviy, qulay va tezkor sayt kerak bo'lsa:
- Telegram: **[@ndilmurodovich](https://t.me/ndilmurodovich)**
