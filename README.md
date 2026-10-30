# Restro POS — Restaurant Point of Sale

A minimal full-stack POS for a small restaurant.

- **Frontend:** React 19 (CRA) + Tailwind CSS + React Router
- **Backend:** Node.js + Express + MySQL (`mysql2`), JWT auth, bcrypt
- **Database:** MySQL `pos` (XAMPP defaults: `root` / no password)

## Features

- **Login** (username / password, JWT).
- **POS screen** — common header/footer; left **2/3** = scrollable category rail + product grid, right **1/3** = cart.
  - Product tile: image, name, price, tap to add.
  - Cart: image, name, qty +/−, line total, remove.
  - **Checkout & Print** saves the order and prints a **58mm thermal receipt** via the browser/OS print dialog.
- **Dashboard** — today's order count & sales, 7-day trend, and CRUD for **products** and **categories**.

## Setup

### 1. Database + backend

```bash
cd server
npm install
npm run migrate   # creates the `pos` database + tables
npm run seed      # creates admin user + sample products
npm start         # API on http://localhost:5000
```

DB credentials live in `server/.env` (defaults match XAMPP: host `localhost`, user `root`, empty password).

### 2. Frontend

```bash
npm install
npm start         # app on http://localhost:3000
```

## Default login

```
username: admin
password: admin123
```

## API (base `/api`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/login` | – | Login, returns JWT |
| GET | `/categories` | – | List categories |
| POST/PUT/DELETE | `/categories[/:id]` | ✔ | Category CRUD |
| GET | `/products?category=:id` | – | List products |
| POST/PUT/DELETE | `/products[/:id]` | ✔ | Product CRUD |
| POST | `/orders` | – | Create order (checkout) |
| GET | `/dashboard` | ✔ | Today's stats + 7-day trend |

## Thermal printing

The receipt component is hidden on screen and revealed only for printing (see
`src/index.css` → `.receipt-print` / `@media print`, sized `58mm`). "Checkout &
Print" calls `window.print()`; set your thermal printer as the print target
(or default printer) in the browser/OS dialog. Change `58mm` to `80mm` in
`index.css` for wider rolls.
