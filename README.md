# 🏪 Multi-Vendor Store

A full-stack, Shopify-style **multi-vendor e-commerce platform** built with the **PERN stack** (PostgreSQL, Express.js, React.js, Node.js). Anyone can sign up as a merchant and launch their own online store, customers can shop and place orders, and admins can oversee every merchant and store on the platform.

> 📚 Built while following the [GreatStack "Storeifly" tutorial](https://youtu.be/x0I50V9T0os). Original assets and reference code: [greatstack.dev/p/storeifly](https://greatstack.dev/p/storeifly)

---

## 🌐 Live Demo

- 🔗 **Frontend:** https://your-app.vercel.app _(replace after deploying)_
- 🔗 **API:** https://your-api.vercel.app _(replace after deploying)_
  > ⚠️ Free hosting tiers may sleep when idle, so the first load can take a few seconds.

### Demo Accounts

Use these throwaway accounts to explore each role (never put real credentials here):

| Role     | Email                | Password        |
| -------- | -------------------- | --------------- |
| Admin    | admin@example.com    | `demo-password` |
| Merchant | merchant@example.com | `demo-password` |
| Customer | customer@example.com | `demo-password` |

## 📸 Screenshots

| Storefront                                  | Merchant Dashboard                                          |
| ------------------------------------------- | ----------------------------------------------------------- |
| ![Storefront](./screenshots/storefront.png) | ![Merchant Dashboard](./screenshots/merchant-dashboard.png) |

| Admin Dashboard                                       | Product Page                                    |
| ----------------------------------------------------- | ----------------------------------------------- |
| ![Admin Dashboard](./screenshots/admin-dashboard.png) | ![Product Page](./screenshots/product-page.png) |

> Create a `screenshots/` folder in the repo root and add your images with these file names.

---

## ✨ Features

### 🛍️ Customer

- Create an account on an individual shop and log in
- Browse products and place orders
- Check order details and status

### 🏬 Merchant

- Create a merchant account and log in
- Add and edit store details
- Create categories and add products
- View store analytics
- Update order statuses
- AI-powered tools: product colour variants, background removal, and model product try-on
- Customize storefront hero layout and store accent colour

### 🛡️ Admin

- Secure admin login
- Platform-wide analytics dashboard
- View store details and merchant details
- Suspend a store account

### ⚙️ General

- Role-based authentication (customer / merchant / admin)
- Image upload and optimization via Cloudinary

---

## 🧰 Tech Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Frontend   | React.js                                        |
| Backend    | Node.js, Express.js                             |
| Database   | PostgreSQL (hosted on [Neon](https://neon.com)) |
| ORM        | Prisma                                          |
| Media & AI | [Cloudinary](https://cloudinary.com)            |
| Deployment | Vercel (frontend, backend)                      |

---

## 📁 Project Structure

```
Multi-Vendor-Store/
├── client/          # React frontend
├── server/          # Express API + Prisma
│   ├── prisma/      # schema.prisma & migrations
│   ├── routes/
│   ├── controllers/
│   └── middlewares/
├── screenshots/     # README images
└── README.md
```

> The structure will be updated as the project grows.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A [Neon](https://neon.com) account (PostgreSQL database)
- A [Cloudinary](https://cloudinary.com) account

### 1. Clone the repository

```bash
git clone https://github.com/mahenaj-tabassum/Multi-Vendor-Store.git
cd Multi-Vendor-Store
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
PORT=5000
DATABASE_URL=your_neon_postgres_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run Prisma migrations and start the server:

```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

### 3. Set up the client

```bash
cd client
npm install
```

Create a `.env` file in `client/`:

```env
VITE_BACKEND_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🗺️ Roadmap

- [ ] Project setup (client + server)
- [ ] Prisma schema and Neon database connection
- [ ] Authentication for customers, merchants, and admin
- [ ] Merchant dashboard: store details, categories, products
- [ ] Customer storefront: browse, cart, checkout, order tracking
- [ ] Order management and status updates
- [ ] Analytics (merchant and admin)
- [ ] Admin tools: view and suspend stores
- [ ] Cloudinary image upload and AI features
- [ ] Deployment (then update the Live Demo links and demo accounts)
- [ ] Add screenshots to the `screenshots/` folder

---

## 🤝 Contributing

Suggestions and improvements are welcome. Fork the repo, create a feature branch, and open a pull request.

## 📄 License

This project is for learning purposes. Add a license (e.g., MIT) before making it public for reuse.

## 👩‍💻 Author

**Mahenaj Tabassum Powshi**

- GitHub: [@mahenaj-tabassum](https://github.com/mahenaj-tabassum)
- Portfolio: [portfolio-web-0-1.netlify.app](https://portfolio-web-0-1.netlify.app/)
- Email: mahenaj.dev@gmail.com

## 🙏 Acknowledgements

- [GreatStack](https://www.youtube.com/@GreatStackDev) for the tutorial
- [Neon](https://neon.com), [Cloudinary](https://cloudinary.com), and [Prisma](https://www.prisma.io/)
