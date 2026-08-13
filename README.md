# Robot Feedback — Frontend

**Bank of Abyssinia · Internal Use Only**

Frontend for the robot customer feedback platform, serving both the customer-facing kiosk and the admin panel.

---

## Prerequisites

- Node.js 20+ (for standalone dev)
- Or Docker Compose via the backend repo (recommended)

---

## Running with Docker

Orchestrated from the backend repo. Clone both repos as siblings, then:

```bash
cd boa-robot-feedback-backend
docker compose up -d
```

---

## Running Standalone

```bash
npm install
npm run dev
```

Create a `.env.local` file with the required API URL before starting.  
Do not commit `.env.local`.

---

## Tech Stack

- **Framework** — Next.js 14, TypeScript
- **Styling** — Tailwind CSS
- **State** — TanStack Query

---

*For access credentials and deployment details, contact the project maintainer.*
