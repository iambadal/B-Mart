# B-Mart Frontend

B-Mart is a React single-page storefront and admin interface for the B-Mart e-commerce application. This package contains the browser client; product, account, order, and payment data are served by the companion Express backend.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Available commands](#available-commands)
- [Routes](#routes)
- [Project structure](#project-structure)
- [Application architecture](#application-architecture)
- [Backend integration](#backend-integration)
- [Build and deployment](#build-and-deployment)

## Features

### Shopping

- Browse the home page, product categories, featured and new products, and tag collections.
- Search, filter, sort, and view product details, images, and ratings.
- Add products to a persistent browser cart and wishlist.
- Sign up, sign in, request a password reset, and continue through checkout.
- Verify the account email before signing in, and request a replacement verification link when needed.
- Open order details, cancel eligible orders (with a full refund request for paid, unshipped orders), and rate purchased items after delivery.
- Verify the account email before signing in; request another verification link if needed.
- Open order details, review purchased items after delivery, and cancel an eligible order.
- Pay through the Razorpay checkout flow.

### Customer account

- View and edit profile information and addresses.
- Review order history, product reviews, wishlist, and help/contact information.

### Administration

- View dashboard summaries and sales, category, and stock charts.
- Manage products, orders, users, and promotional banners.

## Technology

- React 19 and React DOM
- Vite 6 with the React plugin
- React Router 7
- TanStack Query 5 for server data and caching
- Axios for HTTP requests
- Tailwind CSS 4 with the Vite plugin
- Recharts, Swiper, Framer Motion, React Icons, and `d9-toast` for interface features
- ESLint 9 for linting

## Getting started

### Requirements

- Node.js and npm (use a current Node.js LTS release).
- The B-Mart backend running locally or a reachable backend URL.
- Razorpay credentials configured in the backend and a public key configured in the frontend to complete checkout.

### Install and run

From the repository root:

```bash
cd frontend
npm install
```

Create a `frontend/.env` file as described below, then start the development server:

```bash
npm run dev
```

Vite prints the local URL in the terminal (usually `http://localhost:5173`). The development server proxies `/api` requests to `http://127.0.0.1:5000` by default. Start the backend separately; see [`../backend/README.md`](../backend/README.md).

## Environment configuration

Vite exposes browser variables prefixed with `VITE_`. Create `frontend/.env`:

```dotenv
VITE_BACKEND_API_URL=http://127.0.0.1:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_BACKEND_API_URL` or `VITE_API_BASE_URL` | Yes for API modules | Backend base URL used by Axios. `VITE_BACKEND_API_URL` takes precedence; both names are supported. For local development, use `http://127.0.0.1:5000`. |
| `VITE_RAZORPAY_KEY_ID` | For Razorpay checkout | Public Razorpay key passed to the browser checkout widget. |

Restart Vite after changing environment values. These values are compiled into the client bundle: never put private keys, secrets, or database credentials in a `VITE_` variable. Keep Razorpay secret credentials in the backend environment.

The Vite development proxy is configured in `vite.config.js` and targets port `5000`. API clients use `VITE_BACKEND_API_URL` directly, so set it to the correct backend origin in local and deployed environments.

## Available commands

Run these from `frontend/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create the production bundle in `dist/`. |
| `npm run preview` | Serve the production build locally for a manual preview. Run `npm run build` first. |
| `npm run lint` | Run ESLint against the frontend source. |

## Routes

| Path | Page / purpose | Access |
| --- | --- | --- |
| `/` | Home and featured storefront | Public |
| `/register` | Create an account | Public |
| `/login` | Sign in | Public |
| `/forgot-password` | Request password reset | Public |
| `/reset-password/:token` | Reset password using a token | Public |
| `/cart` | Shopping cart | Public |
| `/product/:id` | Product details | Public |
| `/category/:cat` | Browse a category | Public |
| `/featured/:sorted` | Browse featured products | Public |
| `/new/:sorted` | Browse new products | Public |
| `/tags/:tag` | Browse products by tag | Public |
| `/checkout` | Checkout and payment | Public route; payment actions require a signed-in user |
| `/user` | Account profile | Signed in |
| `/user/address` | Address management | Signed in |
| `/user/account` | Account settings | Signed in |
| `/user/orders` | Customer orders | Signed in |
| `/user/orders/:id` | Customer order detail | Signed in; order owner only |
| `/user/reviews` | Customer reviews | Signed in |
| `/user/wishlist` | Customer wishlist | Signed in |
| `/user/help` | Help and contact | Signed in |
| `/admin` | Admin dashboard | Signed in as an admin |
| `/admin/products` | Product management | Signed in as an admin |
| `/admin/orders` | Order management | Signed in as an admin |
| `/admin/users` | User management | Signed in as an admin |
| `/admin/banners` | Banner management | Signed in as an admin |
| `*` | Not found page | Public |

The customer account section is wrapped in `PrivateRoute`. The backend must still enforce authorization for protected API operations.

## Project structure

```text
frontend/
├── public/                 Static images and hosting rewrite configuration
├── src/
│   ├── api/                Axios clients and backend request functions
│   ├── components/         Shared storefront and admin UI
│   ├── contexts/           Authentication, cart, and wishlist state
│   ├── data/               Product filter and sort option data
│   ├── Hooks/              Reusable query and feature hooks
│   ├── layouts/            Profile and admin page layouts
│   ├── pages/              Storefront, account, checkout, and admin pages
│   ├── routes/             Route access helpers
│   ├── utils/              Formatting and query helpers
│   ├── App.jsx             Router and application-level providers
│   ├── index.css           Tailwind import and global styles
│   └── main.jsx            React root and TanStack Query setup
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Application architecture

`src/main.jsx` mounts the app, imports global styles, and provides one TanStack Query client. `src/App.jsx` defines routes and wraps them with toast, authentication, cart, and wishlist providers. Route-level pages are loaded lazily and display the shared loader while loading.

Pages call feature hooks in `src/Hooks/`; these hooks use API functions from `src/api/`. The API modules use Axios and send credentialed requests where configured. TanStack Query is set up with retries and automatic focus refetching disabled, plus a five-minute stale time.

The cart and wishlist contexts persist their current contents in browser `localStorage`. Authentication uses access tokens in the client and refresh-cookie requests to the backend. Treat browser storage as user-controlled and do not store secrets there.

```text
Browser / React UI
        │
        ├── React Router pages and layouts
        ├── Context providers: auth, cart, wishlist
        └── Feature hooks → Axios API modules
                             │
                             ▼
                   B-Mart Express API
                     (backend service)
```

## Backend integration

The frontend expects the companion backend's `/api/...` endpoints for authentication, products, users, orders, admin operations, and payment. Requests use the configured backend origin; authentication requests may also include cookies (`withCredentials`). Configure the backend's CORS and cookie settings to allow the frontend origin, especially when deploying the two services on different origins.

Razorpay checkout loads the provider's hosted checkout script from `checkout.razorpay.com`. The browser key ID is public; order creation and payment verification are handled by the backend.

## Build and deployment

Build the static site:

```bash
npm run build
```

Deploy the generated `dist/` directory to a static host. Set `VITE_BACKEND_API_URL` and, if checkout is enabled, `VITE_RAZORPAY_KEY_ID` in the build environment, then rebuild. Configure the host to serve `index.html` for unknown paths so client-side routes such as `/user/orders` and `/admin/products` work on direct navigation. `public/_redirects` contains an `index.html` fallback rule for hosts that support that format.

To inspect the built site locally:

```bash
npm run preview
```

