# FRONTIX Phone

Telefon orqali gaplashilgan mijozlar bazasi. Holatlar: **Kutilmoqda**, **Tasdiqlandi**, **Bekor qilindi** (sababi bilan).
Interfeys o'zbek va rus tillarida (yuqori o'ngdagi UZ/RU tugmasi). Tizimga maksimal **3 xodim** ro'yxatdan o'ta oladi.
Ro'yxatdan o'tish: ism familiya + telefon raqam + parol. Kirish: telefon raqam + parol.
Parol 5 marta noto'g'ri kiritilsa, o'sha raqam 10 daqiqaga bloklanadi.

## Ishga tushirish (dev)

```bash
# 1-terminal — backend (http://localhost:4000)
cd backend
npm install
npm run dev

# 2-terminal — frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

## Sozlamalar (`backend/.env`)

| O'zgaruvchi | Ma'nosi |
|---|---|
| `MAX_USERS` | Nechta xodim ro'yxatdan o'ta oladi (standart 3) |
| `JWT_SECRET` | Production'da majburiy, uzun tasodifiy satr |
| `DB_PATH` | SQLite fayl yo'li |

## Production (bitta port)

```bash
cd frontend && npm run build
cd ../backend && npm run build && NODE_ENV=production npm start
```
Backend `frontend/dist` ni o'zi beradi — hammasi `http://server:4000` da ishlaydi.

## Tuzilishi

- `backend/` — Express + TypeScript + SQLite (`node:sqlite`, Node 22.5+), JWT, parollar `scrypt` bilan hash qilinadi
  - `src/modules/auth` — `register`, `login`, `me`, `capacity`, `users`
  - `src/modules/clients` — ro'yxat (status/qidiruv filtri), statistika, CRUD, status o'zgartirish
- `frontend/` — React + Vite + Tailwind v4, `src/lib/i18n.ts` da barcha uz/ru matnlar
