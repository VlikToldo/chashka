# Development Tasks — CHASHKA Backend
# 2026-04-23

---

## ✅ DONE

### Архітектура та конфіг
- [x] Express + MongoDB + Mongoose
- [x] Структура папок (models, routes/public, routes/admin, controllers, middleware, config, services, schemas)
- [x] Cloudinary config + middleware (per-type трансформації: menu 1200×675, about 1200×400, cover 600×600)
- [x] DeepL auto-translation — multilingual fields `{ uk, en, es }` в усіх моделях
- [x] Morgan logging
- [x] CORS з `ALLOWED_ORIGIN` env (fallback `*` для dev)
- [x] Rate limiting на auth ендпоінти (20 req / 15 хв)
- [x] Zod валідація на всіх POST/PUT ендпоінтах

### Моделі
- [x] `Section` — `name { uk, en, es }`, order
- [x] `MenuItem` — sectionId, `name/ingredients/allergens/yield { uk, en, es }`, price, image, order
- [x] `AboutBlock` — `title/text { uk, en, es }`, image, order
- [x] `WorkingHours` — singleton, slots[]
- [x] `CoverPhoto` — singleton, image
- [x] `AdminUser` — email (unique), passwordHash, firstName, lastName
- [x] `Venue` — singleton, `address { uk, en, es }`, phone

### Public API
- [x] `GET /api/sections`
- [x] `GET /api/menu?sectionId=:id`
- [x] `GET /api/about`
- [x] `GET /api/cover-photo`
- [x] `GET /api/venue`

### Admin Auth
- [x] `POST /api/admin/register`
- [x] `POST /api/admin/login`
- [x] `GET /api/admin/profile`
- [x] `PUT /api/admin/profile`
- [x] `PUT /api/admin/password`

### Admin CRUD
- [x] Sections (GET, POST, PUT, DELETE)
- [x] MenuItems (GET, POST, PUT, DELETE, POST image)
- [x] WorkingHours (GET, PUT)
- [x] CoverPhoto (GET, POST image)
- [x] AboutBlocks (GET, POST, PUT, DELETE, POST image)
- [x] Venue (GET, PUT)
