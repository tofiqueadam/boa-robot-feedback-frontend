# Aria Robot Feedback — Frontend

**Bank of Abyssinia · Digital Service Innovation**

Next.js frontend for the Aria robot feedback platform. Serves two distinct surfaces: a touch-friendly Amharic kiosk for customers to rate robot interactions, and a full admin panel for branch managers and superadmins to analyze feedback.

---

## Project Structure

```
boa-robot-feedback-frontend/
├── app/
│   ├── (kiosk)/r/            Customer feedback kiosk (public)
│   └── admin/                Admin panel (authenticated)
│       ├── login/
│       ├── questions/
│       ├── responses/
│       └── settings/
├── components/
│   ├── kiosk/                Kiosk UI components
│   ├── admin/                Admin UI components
│   └── ui/                   Shared components
├── lib/
│   ├── api.ts                API client (fetch wrappers)
│   ├── permissions.ts        Role-based access helpers
│   └── PermissionsContext.tsx React context for permissions
├── types/
│   └── index.ts              Shared TypeScript types
└── public/                   Static assets (BOA logos)
```

---

## Running with Docker (Recommended)

This frontend is orchestrated from the backend repo's `docker-compose.yml`. Clone both repos as siblings and run from the backend repo:

```bash
cd boa-robot-feedback-backend
docker compose up -d
```

The frontend is available at `http://localhost:3000` (direct) or `http://localhost` (via Nginx proxy).

---

## Running Standalone

For local development without Docker:

```bash
npm install
npm run dev
```

Set the API URL by creating a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Key Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/r/[robotId]` | Public | Customer feedback kiosk |
| `/admin/login` | Public | Admin sign-in |
| `/admin` | Authenticated | Dashboard / response overview |
| `/admin/questions` | Authenticated | Manage feedback questions |
| `/admin/responses` | Authenticated | Browse and filter responses |
| `/admin/settings` | Superadmin | Role permissions & account settings |

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2 | React framework (App Router) |
| TypeScript | 5.5 | Type safety |
| Tailwind CSS | 3.4 | Styling |
| TanStack Query | 5.x | Server state & caching |
| dnd-kit | 6/8 | Drag-and-drop question reordering |
| date-fns | 3.x | Date formatting |

---

## Design Notes

- **Kiosk UI** is optimised for touch screens at branch kiosks — large tap targets, Amharic text, no keyboard input required.
- **Admin panel** is role-aware — components check permissions from `PermissionsContext` before rendering management actions.
- **API communication** goes through the Nginx proxy in production (`/api/*` → backend). In standalone dev mode it talks directly to `NEXT_PUBLIC_API_URL`.
- **Authentication** uses HTTP-only cookies managed by the backend. No tokens are stored in `localStorage`.
