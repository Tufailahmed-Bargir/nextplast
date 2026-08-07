# NexPlast

Circular economy platform for plastic recycling, Nature Coin rewards, AI detection, collector verification, and an eco marketplace.

**NexPlast Version 1.0** — college final-year project demonstration ready.

## Features

- Email + Google authentication with RBAC (`USER`, `COLLECTOR`, `RECYCLER`, `SELLER`, `ADMIN`, `SUPER_ADMIN`)
- Sell plastic workflow with Cloudinary uploads and AI detection
- Separate FastAPI YOLOv8 AI service (bounding boxes, confidence, fraud checks)
- Collector pickup, OTP verification, wallet credit
- Nature Coin wallet (earn / spend; not cash-convertible)
- Marketplace with cash, coins, and hybrid checkout
- Admin panel: users, listings, inventory, coins, analytics, CSV exports
- Environmental impact, leaderboard, notifications, settings, profile referral QR
- PDF document helpers, QR generation, Nodemailer templates (SMTP optional)

## Architecture

```
Browser → Next.js 15 (App Router, Server Actions, Prisma)
                │
                ├─ Neon PostgreSQL
                ├─ Cloudinary
                └─ FastAPI AI service (YOLOv8)  [server-side only]
```

## Folder Structure

```
src/app/                 Next.js routes (dashboard, admin, collector, API)
src/features/            Domain modules (auth, plastic, marketplace, ai, …)
src/services/            Cross-cutting (email, pdf, qr, storage)
src/components/          Shared UI
prisma/                  Schema + migrations
services/ai-service/     FastAPI YOLOv8 microservice
scripts/                 promote-admin, seed-demo
```

## Installation

```bash
bun install
cp .env.example .env   # fill secrets — never commit .env
bun run db:generate
bunx prisma migrate deploy
bun run db:seed        # optional demo dataset
```

### AI service

```bash
cd services/ai-service
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

### Next.js

```bash
bun run dev
```

## Environment Variables

Required (existing `.env`):

- `DATABASE_URL`
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Optional:

- `AI_SERVICE_URL`, `AI_SERVICE_API_KEY`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

## Database Setup

```bash
bunx prisma migrate deploy
bunx prisma generate
bunx prisma studio
```

## Running the Project

| Command | Purpose |
| --- | --- |
| `bun run dev` | Next.js dev server |
| `bun run build` / `bun run start` | Production |
| `bun run lint` / `bun run typecheck` | Quality gates |
| `bun run db:seed` | Demo data |
| `bun run ai:dev` | FastAPI AI service |

## Demo Credentials

After `bun run db:seed` (password for all: `Demo@12345`):

| Role | Email |
| --- | --- |
| Super Admin | `admin1@demo.nexplast.local` |
| User | `user1@demo.nexplast.local` |
| Collector | `collector1@demo.nexplast.local` |
| Recycler | `recycler1@demo.nexplast.local` |

## Nature Coin

- 1 Nature Coin ≈ 100 g standard recyclable plastic
- Internal value ≈ ₹0.50 / coin (not cash-out)
- Redeemable in the NexPlast Marketplace (hybrid payments supported)

## Screenshots

> Placeholder — add viva screenshots under `docs/screenshots/` (landing, sell, AI, collector, marketplace, admin).

## Future Scope

- Fine-tuned plastic YOLO weights
- Redis + background AI queues
- Live email delivery + SMS OTP
- Native QR scan for collectors
- Advanced Excel analytics packs

## License

Private — NexPlast college / startup project.

## Contributors

Final-year project team — NexPlast.
