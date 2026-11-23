# AAYNA — Looking good, simplified.

AAYNA is a responsive salon and self-care discovery and appointment booking platform. Customers can explore services, request appointments, and complete supported payments. Administrators manage services, users, transactions, and self-care journal articles. The interface supports light and dark themes.


| Resource | Link |
| --- | --- |
| Live website | `https://aayna-client.vercel.app/` |
| Client repository | `https://github.com/say33eed/aayna-client` |
| Server repository | `https://github.com/say33eed/aayna-server` |

## Important features

- Browse and search salon services with category and sorting filters.
- View individual services, request appointments, and follow booking/payment status.
- Email/password and Google sign-in through Better Auth.
- Customer and administrator dashboards with role-aware navigation.
- Admin service and category management, user management, and transaction views.
- Self-Care Journal with article listings and individual articles; administrators can manage content.
- Featured homepage content, How It Works section, responsive navigation, and branded empty/not-found states.
- Accessible branded dropdowns and light/dark theme support.

## Technology stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Better Auth, React Hook Form, Zod, TanStack Query, Lucide React, and Sonner. The frontend connects to a separate Node.js/Express/MongoDB API. Stripe handles test-mode checkout on the backend.

## Prerequisites

- Node.js 22 and npm
- Running AAYNA API server (see server README)
- Environment configuration for both applications

## Installation and local development

```powershell
git clone https://github.com/say33eed/aayna-client.git
cd aayna-client
npm ci
```

Create a local `.env.local` (never commit it) and configure the required values listed below. Then run:

```powershell
npm run dev
```

Visit `http://localhost:3000`. The backend should be running separately, normally at `http://localhost:5000`.

## Required environment variable names

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Public API base URL used by the client |
| `API_PROXY_TARGET` | Server-side destination for Next.js API proxy requests |

Set URLs according to your actual local or deployed API configuration. Do not put server secrets in `NEXT_PUBLIC_*` variables. Authentication, database, Google OAuth, Stripe, and ImgBB credentials belong on the server.

## Validation and production

```powershell
npm run lint
npm run build
npm start
```

Deploy the client to a Next.js-compatible host such as Vercel. Configure the environment variables in the hosting dashboard and allow the deployed client origin in the API server configuration. Verify direct navigation and refresh for public, authenticated, and dashboard routes. Test Stripe checkout using test-mode credentials and a correctly configured webhook before submission.

## Security

Never commit `.env`, `.env.local`, access tokens, OAuth secrets, MongoDB credentials, Stripe secrets, or ImgBB API keys. Use separate client/server repositories and server-side role checks for protected API operations.
