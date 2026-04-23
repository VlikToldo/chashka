# Backend Tasks — CHASHKA v2

## 1. Модель User — додати поля

До існуючої моделі User додати:

```js
firstName: { type: String, default: "" },
lastName:  { type: String, default: "" },
```

---

## 2. GET /api/admin/profile — профіль адміна

- Авторизований ендпоінт (JWT)
- Повертає дані поточного юзера

**Response:**

```json
{
  "_id": "...",
  "email": "...",
  "firstName": "...",
  "lastName": "..."
}
```

---

## 3. PUT /api/admin/profile — оновити профіль

- Авторизований ендпоінт (JWT)
- Дозволяє змінити `email`, `firstName`, `lastName`

**Request body:**

```json
{
  "email": "...",
  "firstName": "...",
  "lastName": "..."
}
```

**Response:** оновлений об'єкт юзера (без пароля)

---

## 4. PUT /api/admin/password — змінити пароль

- Авторизований ендпоінт (JWT)

**Request body:**

```json
{
  "currentPassword": "...",
  "newPassword": "..."
}
```

**Логіка:**

1. Перевірити `currentPassword` через bcrypt
2. Якщо невірний → повернути `400 { message: "Wrong password" }`
3. Захешувати `newPassword` → зберегти

**Response:** `200 OK`

---

## 5. Модель Venue — новий singleton-документ

Нова колекція `venue` з одним документом:

```js
{
  address: { type: String, default: "" },
  phone:   { type: String, default: "" },
}
```

При першому GET — якщо документ не існує, створити з пустими полями.

---

## 6. GET /api/admin/venue — дані закладу (адмін)

- Авторизований ендпоінт (JWT)

**Response:**

```json
{
  "address": "Sant Bartolomé 122, El Campello, Valencia, Spain",
  "phone": "+34 600 000 000"
}
```

---

## 7. PUT /api/admin/venue — оновити дані закладу

- Авторизований ендпоінт (JWT)

**Request body:**

```json
{
  "address": "...",
  "phone": "..."
}
```

**Response:** оновлений об'єкт

---

## 8. GET /api/venue — публічний ендпоінт

- **БЕЗ авторизації**
- Використовується на фронтенді в Header, Footer і сторінці "Про нас"

**Response:**

```json
{
  "address": "...",
  "phone": "..."
}
```
