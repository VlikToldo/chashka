# Project State — CHASHKA Coffee Shop

# Стан проєкту — 2026-04-23

---

## Stack

- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS 4 + Framer Motion + Axios
- **Backend:** Node.js + Express.js (ES modules)
- **Database:** MongoDB (Mongoose)

---

## Frontend — ЗРОБЛЕНО ✅

### Публічна частина

| Сторінка / Компонент | Опис                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `MenuPage`           | Завантажує розділи з `GET /api/sections`, позиції з `GET /api/menu?sectionId=`. Навігація за розділами динамічна. |
| `MenuSection`        | Рядок позиції: назва + ціна + ingredients як підзаголовок. Розгортається → показує фото, алергени, вихід.         |
| `AboutPage`          | Завантажує блоки з `GET /api/about`. Fallback — статичні тексти з перекладів якщо API не відповідає.              |
| `Header`             | Верхній бар: адреса + вибір мови + маленький лінк `Admin` (тільки desktop).                                       |
| `Footer`             | Контакти, графік (статичний поки), Instagram.                                                                     |
| `LanguageSwitcher`   | ES / EN / UK, зберігається в localStorage.                                                                        |

### Адмін панель (`/admin/*`)

| Маршрут           | Опис                                             |
| ----------------- | ------------------------------------------------ |
| `/admin/login`    | Форма входу → `POST /api/admin/login`            |
| `/admin/register` | Форма реєстрації → `POST /api/admin/register`    |
| `/admin`          | Доступна без авторизації (тимчасово). 5 вкладок: |

**Вкладки адмін панелі:**

| Вкладка  | Компонент             | API                                         |
| -------- | --------------------- | ------------------------------------------- |
| Розділи  | `SectionManager`      | CRUD `/api/admin/sections`                  |
| Позиції  | `MenuItemManager`     | CRUD `/api/admin/menu-items` + upload image |
| Графік   | `WorkingHoursManager` | GET/PUT `/api/admin/working-hours`          |
| Заставка | `CoverPhotoManager`   | GET/POST `/api/admin/cover-photo`           |
| Про нас  | `AboutManager`        | CRUD `/api/admin/about` + upload image      |

### Типи (TypeScript)

```
MenuItem:   { _id, sectionId, name, price, ingredients?, allergens?, yield?, image? }
PublicSection: { _id, name, order? }
AboutBlock: { _id, title, text, image?, order? }
AdminMenuItem: { _id?, sectionId, name, price, ingredients, allergens, yield, image? }
TimeSlot:   { id, days: DayKey[], openTime, closeTime }
```

### Auth (фронтенд)

- `AuthContext` зберігає token + user в localStorage
- `adminService` додає `Authorization: Bearer <token>` до всіх запитів
- Захист роуту адмін панелі — поки вимкнений, логіка готова

---

### Залежності встановлені

```bash
npm install jsonwebtoken bcrypt multer ✅
```

---

## Backend — ГОТОВО ✅ (2026-04-23) + Cloudinary

### Структура реалізована

```
src/
  config/
    cloudinary.js           ✅ (NEW)
  models/
    Section.js              ✅
    MenuItem.js             ✅ (нова схема з sectionId)
    AboutBlock.js           ✅
    WorkingHours.js         ✅
    CoverPhoto.js           ✅
    AdminUser.js            ✅
  routes/
    public/
      sections.js           ✅
      menu.js               ✅
      about.js              ✅
    admin/
      auth.js               ✅
      sections.js           ✅
      menuItems.js          ✅
      workingHours.js       ✅
      coverPhoto.js         ✅
      about.js              ✅
  controllers/
    public/
      sectionsController.js ✅
      menuController.js     ✅
      aboutController.js    ✅
    admin/
      authController.js     ✅
      sectionsController.js ✅
      menuItemsController.js ✅ (updated for Cloudinary)
      workingHoursController.js ✅
      coverPhotoController.js ✅ (updated for Cloudinary)
      aboutController.js    ✅ (updated for Cloudinary)
  middleware/
    authenticateAdmin.js    ✅ (JWT Bearer validation)
    uploadCloudinary.js     ✅ (NEW: Cloudinary storage)
    upload.js               🗑️ (deprecated, use uploadCloudinary)
  index.js                  ✅
```

### Публічні API (готовий)

| Метод | URL                       | Готово |
| ----- | ------------------------- | ------ |
| GET   | `/api/sections`           | ✅     |
| GET   | `/api/menu?sectionId=:id` | ✅     |
| GET   | `/api/about`              | ✅     |

### Admin Auth (готовий)

| Метод | URL                   | Готово |
| ----- | --------------------- | ------ |
| POST  | `/api/admin/register` | ✅     |
| POST  | `/api/admin/login`    | ✅     |

### Admin Protected Routes (готовий)

| Ресурс                     | GET | POST | PUT | DELETE | Upload | Готово |
| -------------------------- | --- | ---- | --- | ------ | ------ | ------ |
| `/api/admin/sections`      | ✅  | ✅   | ✅  | ✅     | -      | ✅     |
| `/api/admin/menu-items`    | ✅  | ✅   | ✅  | ✅     | ✅     | ✅     |
| `/api/admin/working-hours` | ✅  | -    | ✅  | -      | -      | ✅     |
| `/api/admin/cover-photo`   | ✅  | -    | -   | -      | ✅     | ✅     |
| `/api/admin/about`         | ✅  | ✅   | ✅  | ✅     | ✅     | ✅     |

### Залежності та Конфіг

- [x] JWT (jsonwebtoken) з expiry: 7d
- [x] Password hashing (bcrypt) з salt rounds: 10
- [x] ~~File uploads (multer) → `/public/uploads/`~~ DEPRECATED
- [x] **File uploads (Cloudinary)** → CDN URLs, auto-optimization ✨
- [x] CORS enabled (no restrictions)
- [x] `.env` файл з базовими змінними + Cloudinary

---

## Known Issues

- ✅ **FIXED:** Стара схема MenuItem замінена на нову з sectionId
- ✅ **FIXED:** Seed-дані (seedData.js) більше не використовуються
- ⚠️ **WARNING:** JWT_SECRET у .env встановлений на placeholder — змінити в продакшні на강ий рядок
- ⚠️ **TODO:** CORS налаштований без обмежень — для продакшну треба вказати конкретний origin
- ℹ️ **NOTE:** Файли завантажуються в локальну `/public/uploads/` — для продакшну розглянути S3/Cloudinary

---

## 📋 Summary for Frontend Team

### ✅ Backend Status: READY

**Server:** `http://localhost:3000`  
**Database:** MongoDB Atlas (connected)  
**Image Storage:** Cloudinary (requires credentials)

### 🎯 Frontend Action Items

1. **Update API base URL** from `:5000` to `:3000`
2. **Get Cloudinary credentials** from https://cloudinary.com (free tier)
3. **Test all endpoints** (see testing guide above)
4. **Image URLs** now come from Cloudinary CDN (no `/uploads/` prefix)

### 📞 API Quick Reference

```
Public:
- GET  /api/sections
- GET  /api/menu?sectionId=ID
- GET  /api/about

Auth:
- POST /api/admin/register  →  { token, user }
- POST /api/admin/login     →  { token, user }

Admin (requires JWT):
- /api/admin/sections       →  CRUD
- /api/admin/menu-items     →  CRUD + image upload
- /api/admin/working-hours  →  GET, PUT
- /api/admin/cover-photo    →  GET, POST image
- /api/admin/about          →  CRUD + image upload
```

### ⚡ What's New

- ✨ Cloudinary integration (CDN, auto-optimization)
- 🔐 JWT authentication (7-day expiry)
- 📦 3 test sections seeded in DB
- 🚀 Production-ready file uploads
