# B-Mart

B-Mart is a full-stack e-commerce application with a React storefront and an Express REST API. Customers can discover products, manage a cart and wishlist, complete checkout, and manage their accounts. Administrators have tools for managing products, orders, users, banners, and store summaries.

## Project at a glance

| Part | Stack | Documentation |
| --- | --- | --- |
| Frontend | React 19, Vite, React Router, TanStack Query, Tailwind CSS | [Frontend README](frontend/README.md) |
| Backend | Node.js, Express 5, MongoDB, Mongoose | [Backend README](backend/README.md) |

The backend also integrates JWT authentication, Razorpay payments, Cloudinary image storage, and Mailtrap email delivery.

## Features

- Product browsing with search, categories, filters, sorting, tags, product details, and reviews.
- Customer registration, login, password reset, profile and address management.
- Persistent cart and wishlist, order history, and checkout with Razorpay.
- Admin dashboard and tools for products, orders, users, and promotional banners.
- Product and banner image uploads stored through Cloudinary.
- MongoDB persistence with periodic release of expired order stock reservations.

## Repository layout

```text
B-Mart/
├── frontend/   React single-page application
├── backend/    Express REST API
└── README.md   Project overview and quick start
```

## Run locally

### Prerequisites

- Node.js and npm
- MongoDB, local or hosted
- Provider credentials for Cloudinary, Razorpay, and Mailtrap for the features that use them

### 1. Configure and start the backend

```bash
cd backend
npm install
```

Create `backend/.env` and configure the database URI, JWT secrets, and any integrations you plan to use. See the [backend configuration guide](backend/README.md#environment-configuration).

Start the API:

```bash
npm run dev
```

By default, the API listens on `http://localhost:5000`.

### 2. Configure and start the frontend

In another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```dotenv
VITE_BACKEND_API_URL=http://127.0.0.1:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Start the Vite development server:

```bash
npm run dev
```

Vite prints the local storefront URL, usually `http://localhost:5173`. Set the backend's `FRONTEND_URL` to that origin so credentialed browser requests are accepted.

## Useful commands

Run commands from the corresponding package directory:

| Package | Command | Purpose |
| --- | --- | --- |
| Frontend | `npm run dev` | Start local development server |
| Frontend | `npm run build` | Build static production assets in `dist/` |
| Frontend | `npm run lint` | Run ESLint |
| Frontend | `npm run preview` | Preview the production build locally |
| Backend | `npm run dev` | Run API with Node watch mode |
| Backend | `npm start` | Run API normally |

## Architecture

```text
Customer / admin browser
          │
          ▼
 React + Vite frontend
          │  HTTP API requests, bearer token, refresh cookie
          ▼
    Express REST API ───── MongoDB
          ├─────────────── Cloudinary (media)
          ├─────────────── Razorpay (payments)
          └─────────────── Mailtrap (email)
```

The frontend and backend can be deployed separately. Configure the frontend API URL and the backend's allowed `FRONTEND_URL` for the deployed origins. See each package README for route details, environment variables, and deployment notes.

## Security and configuration

- Keep `.env` files and all private credentials out of source control.
- Frontend variables prefixed with `VITE_` are included in browser builds; only public values such as the Razorpay key ID belong there.
- Keep JWT, database, Cloudinary, email, and Razorpay secret credentials on the backend.
- Use HTTPS and configure credentialed CORS and cookie settings for production deployments.

## Documentation

- [Frontend setup, routes, and deployment](frontend/README.md)
- [Backend setup, API overview, and deployment](backend/README.md)

