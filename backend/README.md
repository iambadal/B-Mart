# B-Mart Backend

B-Mart's backend is a Node.js and Express REST API for the B-Mart storefront. It handles accounts and authentication, product catalog operations, customer data, order reservations, payment verification, image uploads, and admin operations. MongoDB stores application data; Cloudinary stores uploaded images.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Available commands](#available-commands)
- [API overview](#api-overview)
- [Project structure](#project-structure)
- [Architecture and behavior](#architecture-and-behavior)
- [Frontend integration](#frontend-integration)
- [Production notes](#production-notes)

## Features

- User registration with expiring email verification links, login, access-token authentication, refresh cookies, logout, and password reset email.
- Product listing and detail endpoints, search/filter query handling, and admin product management.
- Customer profile, address, review, order-history, wishlist, and banner endpoints.
- Order creation with stock reservation and automatic release of expired reservations.
- Razorpay order creation and signature verification.
- Admin dashboard summaries and product, order, user, and banner management.
- Cloudinary image upload and deletion helpers.
- Centralized 404 and error handling middleware.

## Technology

- Node.js (ES modules) and Express 5
- MongoDB with Mongoose 8
- JWT and `bcryptjs` for authentication and password hashing
- Razorpay Node SDK for payment operations
- Cloudinary SDK and Multer for media uploads
- Nodemailer and Mailtrap for email delivery
- `node-cron` for periodic order reservation cleanup
- `dotenv`, `cors`, and `cookie-parser`

## Getting started

### Requirements

- Node.js and npm (a current Node.js LTS release is recommended).
- A MongoDB database, local or hosted.
- Cloudinary credentials for image uploads.
- Razorpay credentials to use checkout and payment verification.
- Mailtrap credentials to send password reset email.

### Install and start

From the repository root:

```bash
cd backend
npm install
```

Create `backend/.env` using the configuration reference below, then start the development server:

```bash
npm run dev
```

The API listens on port `5000` unless `PORT` is set. It connects to MongoDB before accepting requests and retries a failed connection up to five times, waiting five seconds between attempts. Start the frontend separately from `../frontend`.

## Environment configuration

Create a `backend/.env` file. Supply service credentials from their providers; do not commit this file.

```dotenv
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/bmart

JWT_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_another_long_random_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Mailtrap SMTP values used outside production
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=your_mailtrap_username
EMAIL_PASS=your_mailtrap_password
EMAIL_FROM="B-Mart <your_verified_sender@example.com>"

# Mailtrap Sending API values used when NODE_ENV=production
MAILTRAP_API_TOKEN=your_mailtrap_api_token
MAILTRAP_SENDER_EMAIL=sender@example.com
MAILTRAP_SENDER_NAME=B-Mart
```

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Selects development SMTP or production Mailtrap API email delivery and controls error stack output. |
| `PORT` | HTTP listening port; defaults to `5000`. |
| `FRONTEND_URL` | Allowed browser origin for credentialed CORS and the base URL used in password reset and email verification links. Defaults to `http://localhost:5173`. |
| `MONGO_URI` | MongoDB connection URI. |
| `JWT_SECRET` | Signs and verifies access tokens. Required for authentication. |
| `JWT_REFRESH_SECRET` | Signs refresh tokens; falls back to `JWT_SECRET` when omitted. |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Server credentials for Razorpay order creation and verification. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary credentials for image storage. |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` | Mailtrap SMTP settings used outside production. |
| `EMAIL_SECURE`, `EMAIL_FROM` | Optional SMTP TLS setting and sender display address. Port `465` enables TLS automatically; Gmail SMTP requires TLS. |
| `MAILTRAP_API_TOKEN`, `MAILTRAP_SENDER_EMAIL`, `MAILTRAP_SENDER_NAME` | Mailtrap Sending API settings used when `NODE_ENV=production`. |

Do not expose backend secrets in frontend configuration or source control. The frontend uses its own `VITE_BACKEND_API_URL` and public `VITE_RAZORPAY_KEY_ID` settings.

For Gmail SMTP in development, use `EMAIL_HOST=smtp.gmail.com`, `EMAIL_PORT=465`, `EMAIL_SECURE=true`, and your full Gmail address as `EMAIL_USER`. Set `EMAIL_PASS` to a Google App Password, not your regular account password. Google documents authenticated SMTP on ports 465 (SSL) and 587 (TLS); App Passwords require 2-Step Verification. [Gmail SMTP settings](https://support.google.com/a/answer/176600) · [Google App Passwords](https://support.google.com/accounts/answer/2461835).

In development, email is sent by SMTP and must have `EMAIL_HOST`, `EMAIL_USER`, and `EMAIL_PASS` configured. The current local environment has none of those settings, so verification email delivery will fail until an SMTP provider is configured. If registration has already created an unverified account, open **Verify email** on the sign-in page and request another link after setting the credentials.

## Available commands

Run these from `backend/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start `server.js` with Node's watch mode. |
| `npm start` | Start the server in normal mode. |
| `npm test` | Placeholder script; no backend test suite is currently configured. |

## API overview

All application routes are mounted under `/api`. Authentication uses a bearer access token on protected routes; refresh-token operations use an HTTP cookie. Admin routes additionally require the authenticated user's `admin` role.

| Base path | Main operations | Access |
| --- | --- | --- |
| `/api/auth` | `POST /register`, `GET /verify-email/:token`, `POST /resend-verification`, `POST /login`, `GET /refresh`, `POST /forgot-pwd`, `POST /reset-pwd`, `POST /logout` | Public or refresh-cookie flow |
| `/api/products` | `GET /`, `GET /:id`; create, update, delete, and bulk operations | Reads public; writes admin-only |
| `/api/user` | Profile, address, reviews, personal orders, wishlist, and banners | Mostly signed in; `GET /banners` is public |
| `/api/orders` | `POST /` creates an order and reserves stock; `GET /mine/:id` fetches the signed-in customer's order; `POST /mine/:id/cancel` cancels an eligible order; list, recent, update, and delete orders | Customer order access; admin order management |
| `/api/payment` | `POST /order`, `POST /verify` | Signed in |
| `/api/admin` | Dashboard summaries, sales, category distribution, stock status, users, and banner management | Admin-only |

Product listing supports search and filter query parameters handled by `helpers/productQuery.js`; pagination and result details are implemented in the product controller. Upload endpoints accept multipart form data. Product uploads support up to five `images` files; profile and banner routes accept their corresponding upload fields.

The endpoint list above is a functional overview, not a complete request/response schema. Refer to the corresponding route and controller modules for accepted fields and response shapes.

## Project structure

```text
backend/
├── config/                 MongoDB, Cloudinary, and Razorpay setup
├── controllers/            Request handling and business logic
├── helpers/                Product query and expired-order cleanup logic
├── middlewares/            Authentication, authorization, and error handling
├── models/                 Mongoose schemas and models
├── routes/                 Express route definitions
├── utils/                  Tokens, email, auth response, uploads, and deletion helpers
├── server.js               Environment loading, middleware, routes, jobs, startup
├── package.json
└── README.md
```

## Architecture and behavior

`server.js` loads environment variables, configures JSON parsing, cookies, and credentialed CORS, mounts API routers, schedules cleanup, and starts after MongoDB connects. Route modules connect URL paths and middleware to controllers. Controllers apply business rules and use Mongoose models for persistence. Shared helpers and utilities cover query construction, token/email operations, file storage, and expired reservations.

```text
Browser client
     │  JSON / multipart requests, bearer token, refresh cookie
     ▼
Express middleware → route → auth/admin checks → controller
                                              │
                          ┌───────────────────┼──────────────────┐
                          ▼                   ▼                  ▼
                       MongoDB             Cloudinary          Razorpay
```

Key behavior:

- Access tokens are checked by `authCheck`; `isAdmin` restricts admin operations to users with the `admin` role.
- New accounts must verify an email link before sign-in. Verification links expire after 24 hours; unverified customers can request a replacement link.
- Accounts created before email verification was added must verify once before they can sign in again; use the resend flow from the login page.
- The refresh endpoint uses a refresh token cookie. The frontend must send credentialed requests and the backend CORS origin must match it.
- New orders reserve inventory. A cron task runs every minute and releases expired reservations through `releaseExpiredOrders.js`.
- Payment verification computes and checks a Razorpay signature on the server using `RAZORPAY_KEY_SECRET`.
- Customers can cancel unpaid pending/processing orders and request a full Razorpay refund when cancelling paid orders that have not shipped. A paid order is marked cancelled only after Razorpay accepts the refund; stock is returned once.
- Product ratings and reviews are limited to a delivered purchase and one review per customer per product. Updating or deleting a review recalculates the displayed average and review count.
- User deletion includes a 30-day TTL index on `deletedAt`; MongoDB removes expired soft-deleted user documents after that period.
- Uploaded files are sent to Cloudinary. Multer temporarily stores uploads under `temp/uploads` for processing.

## Frontend integration

The companion frontend is in [`../frontend`](../frontend). Its Vite development proxy targets `http://127.0.0.1:5000`, and its API clients use `VITE_BACKEND_API_URL`. For local development, run the frontend at `http://localhost:5173` or set `FRONTEND_URL` to the actual frontend origin. Because the API uses credentialed CORS and refresh cookies, configure the exact allowed origin and suitable cookie settings for the deployed origins.

## Production notes

- Set `NODE_ENV=production` and use strong, distinct JWT secrets.
- Use a hosted MongoDB URI and provider credentials stored in the deployment platform's secret manager.
- Set `FRONTEND_URL` to the deployed frontend origin and the frontend's `VITE_BACKEND_API_URL` to the deployed API origin.
- Configure HTTPS and compatible cross-origin cookie settings when frontend and backend use different sites.
- Use Razorpay test credentials during development; keep the secret key on the server.
- The current package scripts do not define migrations, automated tests, or API schema generation.

