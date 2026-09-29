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
- Email verification before sign-in, with expiring links and resend support.
- Persistent cart and wishlist, order history, and checkout with Razorpay.
- Order detail pages, eligible order cancellation, and delivered-purchase ratings.
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

### Start both services together

```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
npm install
npm run dev
```

The root install adds the `concurrently` runner. Before starting, create `backend/.env` and `frontend/.env` using the [backend](backend/README.md#environment-configuration) and [frontend](frontend/README.md#environment-configuration) guides. The root `npm run dev` command starts the API and Vite server with labelled output; press `Ctrl+C` to stop both.

### Start either service separately

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

By default, the API listens on `http://localhost:5000`; Vite prints its storefront URL, usually `http://localhost:5173`. Set the backend's `FRONTEND_URL` to the frontend origin so credentialed browser requests are accepted.

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
| Repository root | `npm run dev` | Run frontend and backend together |

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

