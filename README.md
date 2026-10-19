<div align="center">

<img src="frontend/public/android-chrome-192x192.png" alt="ShopSmart logo" width="76" />

# ShopSmart

### AI-powered grocery shopping, from recipe idea to cart.

Shop groceries with **SmartieAI**: get personalized recipes, find products in
the ShopSmart catalog, and add suggestions to your cart in one click. You can
also ask questions about ShopSmart.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=20232A)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-API-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

**[Live Demo](https://shopsmart-io.onrender.com)**

</div>

## 🛍️ About the Project

**ShopSmart** is an AI-powered online grocery store that brings recipe
discovery and grocery shopping together. At its heart is **SmartieAI**, a
Gemini-powered shopping assistant that can generate personalized recipes from
what shoppers ask for—or what they already have in their cart—find requested
products in the ShopSmart catalog, and answer questions about ShopSmart. It
matches recipe ingredients to available products and lets shoppers add
ingredients or requested products to their cart in a single click, making it
easy to go from a question or meal idea to checkout.

The responsive storefront also supports product discovery, quantity-aware
shopping, secure JWT-based authentication, and order management. A
role-protected admin dashboard brings together sales analytics and tools for
managing the store.

## ✨ Meet SmartieAI

**SmartieAI** is more than a chatbot: it connects recipe ideas, product discovery,
and ShopSmart help directly to the catalog and cart.

1. **Ask for a recipe.** Describe what you feel like making, or get recipe
   ideas based on products already in your cart.
2. **See ingredients matched to store products.** SmartieAI maps recipe
   ingredients to products available in the grocery catalog.
3. **Add matched products in one click.** Turn the ingredients you need into
   cart items without searching for each product individually.
4. **Find products on request.** Ask for a grocery item and SmartieAI finds
   matching products in the ShopSmart catalog, ready to add to your cart with
   one click.
5. **Get help with ShopSmart.** Ask questions about the store and get
   conversational assistance.

By bringing recipe discovery, product lookup, one-click cart actions, and
ShopSmart support into one flow, SmartieAI makes shopping faster and meal
planning actionable—not just inspirational.

## Highlights

- Browse products, search by keyword, and explore product categories.
- Add products to a cart with supported quantity units and options.
- Create an account, sign in, manage account details, and reset a password.
- Place orders and view order history and order details.
- Read and submit product reviews.
- Generate personalized recipes from a shopper's prompt or cart contents with
  Gemini-powered **SmartieAI**.
- Match recipe ingredients to catalog products and add matches to the cart in
  one click.
- Find requested products in the catalog and add them to the cart with one
  click.
- Ask SmartieAI questions about ShopSmart and get conversational help.
- Sign in with JWT-based authentication and role-based access control.
- Review sales analytics and manage products, categories, orders, users, and
  reviews in the admin dashboard.

## Built With

- **Frontend:** React, Vite, React Router, Redux Toolkit, Axios
- **Backend & API:** Node.js, Express
- **Database:** MongoDB, Mongoose
- **AI Assistant:** Google Gemini API (SmartieAI)
- **Supporting Services:** Cloudinary, Nodemailer

## 🚀 Getting Started

Run the frontend and backend locally in separate terminals.

### Prerequisites

- [Node.js](https://nodejs.org/) and npm
- A MongoDB connection string
- Optional service credentials for AI chat, product image uploads, and password-reset email

### 1. Configure the backend

Create `backend/.env` with the values for the services you want to use:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
JWT_RESET_PASSWORD_SECRET_KEY=your_password_reset_secret

# SmartieAI
GEMINI_API_KEY=your_gemini_api_key

# Product image uploads
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET_KEY=your_cloudinary_api_secret

# Password-reset email (SMTP)
SMPT_MAIL=your_email_address
SMPT_PASSWORD=your_email_app_password
```

`MONGODB_URI`, `JWT_SECRET_KEY`, and `JWT_RESET_PASSWORD_SECRET_KEY` are needed
for the database-backed application and authentication flows. Configure the
Gemini, Cloudinary, and SMTP values when using their corresponding features.
Keep real credentials private and out of version control.

Install dependencies and start the API:

```powershell
cd backend
npm install
npm start
```

The API listens at `http://localhost:8000` by default. Its health endpoint is
`http://localhost:8000/health`.

### 2. Configure the frontend

Create `frontend/.env` and point the frontend to the backend API:

```env
VITE_API_URL=http://localhost:8000
```

In a second terminal, install dependencies and start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

---

## 📁 Project Structure

```text
ShopSmart/
├── backend/
│   ├── Config/              # MongoDB connection
│   ├── Controllers/         # API request handlers
│   ├── middleware/          # Authentication and authorization
│   ├── models/              # Mongoose data models
│   ├── routes/              # User, product, category, and chat routes
│   ├── utils/               # Shared server-side helpers
│   ├── index.js             # Express app and API entry point
│   └── package.json
└── frontend/
    ├── public/              # App icons and static assets
    ├── src/
    │   ├── api/             # Axios API client
    │   ├── components/      # Shared UI, including SmartieAI
    │   ├── pages/           # Storefront, account, orders, and admin pages
    │   ├── redux/           # Store, actions, reducers, and constants
    │   ├── utils/           # Shared frontend helpers
    │   ├── App.jsx          # Routes and application shell
    │   └── main.jsx         # Frontend entry point
    └── package.json
```

---

## 📝 License

Distributed under the **MIT License**. See the [LICENSE](./LICENSE) file for more details.
