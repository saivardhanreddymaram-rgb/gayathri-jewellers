# Gayathri Jewellers — Frontend

A complete, professional, responsive e-commerce frontend for **Gayathri Jewellers**, a premium Indian jewellery store.

Built with **React 18 · TypeScript · Tailwind CSS · Vite**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS 3 (custom design tokens) |
| Routing | React Router DOM v6 |
| HTTP client | Axios (with cookie-based session auth) |
| Toasts | react-hot-toast |
| Icons | lucide-react |
| Build tool | Vite 5 |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env.local` file in the project root:

```env
VITE_API_URL=http://localhost:4000/api
```

Set `VITE_API_URL` to your backend API base URL. The frontend never generates OTPs — all auth flows call secure backend endpoints.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 4. Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## Project Structure

```
src/
├── api/              # Typed API client functions (auth, products, cart, orders, admin)
├── components/
│   ├── auth/         # SignUpForm, SignInForm, OTPVerifyScreen, ProtectedRoute
│   ├── layout/       # AnnouncementBar, Header, Footer, PageLayout, Breadcrumb, Logo
│   ├── product/      # ProductCard, FilterPanel
│   └── ui/           # Button, Input, Modal/Drawer, Skeleton, Badge, OTPInput, Pagination, EmptyState
├── constants/        # catalogue.ts (collections, subcategories, validation), routes.ts
├── contexts/         # AuthContext, CartContext, WishlistContext
├── hooks/            # useProductFilters (URL-synced filter + fetch hook)
├── pages/
│   ├── admin/        # AdminLayout, AdminOverview, AdminProducts, AdminCategories,
│   │                 # AdminOrders, AdminCustomers, AdminAdministrators
│   ├── AccountEntry.tsx
│   ├── Home.tsx
│   ├── Women.tsx
│   ├── Men.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   ├── Wishlist.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── OrderConfirmation.tsx
│   ├── Orders.tsx
│   ├── Profile.tsx
│   ├── About.tsx
│   └── Contact.tsx
├── types/            # index.ts — all shared TypeScript types
├── App.tsx           # Router setup + providers
├── main.tsx          # React entry point
└── index.css         # Tailwind base + custom utilities
```

---

## Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Account Entry (Sign Up / Sign In). Redirects to `/home` after auth. |
| `/home` | Auth required | Homepage with hero, collections, featured products |
| `/women` | Public | Women's catalogue with Gold, Silver, One Gram Gold, Stones filters |
| `/men` | Public | Men's catalogue with Gold, Silver, Stones filters (One Gram Gold blocked) |
| `/products` | Public | Full catalogue with search + all filters |
| `/products/:slug` | Public | Product detail page |
| `/wishlist` | Auth required | Customer wishlist |
| `/cart` | Auth required | Shopping bag |
| `/checkout` | Auth required | Checkout form + delivery options |
| `/orders` | Auth required | Order history + delivery tracking |
| `/orders/confirmation/:orderId` | Auth required | Order confirmation page |
| `/profile` | Auth required | Account details |
| `/about` | Public | Brand story |
| `/contact` | Public | Contact page |
| `/admin` | Admin role required | Admin portal — nested routes below |
| `/admin/products` | Admin | Product management (add, edit, hide, delete) |
| `/admin/categories` | Admin | Custom subcategory management |
| `/admin/orders` | Admin | Order management + status updates |
| `/admin/customers` | Admin | Customer directory |
| `/admin/administrators` | Admin | Administrator slot management (max 2) |

---

## Backend API Endpoints Expected

### Auth

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/request-otp` | Request sign-up or sign-in OTP |
| POST | `/api/auth/verify-otp` | Verify OTP and log in |
| GET | `/api/auth/me` | Get current session user |
| POST | `/api/auth/logout` | Destroy session |
| GET | `/api/auth/available-methods` | Returns `{ emailEnabled, smsEnabled }` |

**OTPs are never generated in the browser.** The backend must use Resend (email) or Twilio / equivalent (SMS). If SMS is not configured, return `smsEnabled: false` from `/api/auth/available-methods` and the frontend will hide the SMS option automatically.

### Products

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/products` | List products with filters |
| GET | `/api/products/:slug` | Single product |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/bestsellers` | Bestseller products |
| GET | `/api/products/top-valuable` | Top & Valuable products |
| GET | `/api/products/:slug/related` | Related products |
| POST | `/api/admin/products` | Create product (admin) |
| PATCH | `/api/admin/products/:id` | Update product (admin) |
| DELETE | `/api/admin/products/:id` | Delete product (admin) |
| POST | `/api/admin/upload` | Upload product image (admin) |

### Cart, Wishlist, Orders, Delivery

| Method | Endpoint | Purpose |
|---|---|---|
| GET/POST/PATCH/DELETE | `/api/cart`, `/api/cart/items/:id` | Cart operations |
| GET/POST/DELETE | `/api/wishlist`, `/api/wishlist/items/:id` | Wishlist operations |
| GET | `/api/delivery-options` | Available delivery options |
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | Customer's order history |
| GET | `/api/orders/:id` | Single order |
| GET/PATCH | `/api/admin/orders`, `/api/admin/orders/:id` | Admin order management |

### Admin

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/customers` | Customer list |
| GET | `/api/admin/administrators` | Admin list |
| POST | `/api/admin/administrators/:id/promote` | Promote to admin (max 2) |
| POST | `/api/admin/administrators/:id/demote` | Remove admin role |
| GET/POST/DELETE | `/api/admin/categories` | Custom subcategory CRUD |

---

## Catalogue Rules (enforced on both frontend and backend)

| Rule | Detail |
|---|---|
| Allowed collections | Gold, Silver, One Gram Gold, Stones |
| One Gram Gold | Women only — never shown for Men |
| Men collections | Gold, Silver, Stones |
| Forbidden | Diamond, Platinum, and any other collection |
| Mobile number | Mandatory at sign-up and checkout |
| Admin slots | Maximum 2 accounts with admin role |

---

## Design Tokens

The Tailwind config defines these custom tokens:

| Token | Value | Use |
|---|---|---|
| `ivory` | `#FAF6EE` | Page background |
| `espresso` | `#3D2416` | Primary text and dark elements |
| `gold-accent` | `#D4AF37` | CTA buttons, accents |
| Font serif | Cormorant Garamond | Headings |
| Font sans | Lato | Body text, labels, UI |

---

## Accessibility

- Semantic HTML with ARIA labels throughout
- Visible focus styles on all interactive elements
- 44×44 px minimum touch targets
- Screen reader labels on icons and buttons
- `aria-live` and `role="alert"` on error and toast messages
- Keyboard-navigable modals with Escape-to-close and focus trap
- `aria-expanded` on toggles and menus
- Reduced motion respected via `@media (prefers-reduced-motion: reduce)`

---

## Notes

- The frontend does **not** generate OTPs, store SMS/email keys, or expose any secrets.
- Delivery fees and dates are **never invented** — they come from backend/admin data only.
- Fake ratings, reviews, sale counts, live visitor counts, and fake delivery promises are **not present**.
- Diamond and Platinum are **blocked at the type level** and will never appear in filters, product forms, or categories.
