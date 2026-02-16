Slooze Food - Full Stack Assessment Submission

This repository contains the solution for the Slooze Full Stack SDE Intern Assessment. It is a role-based food ordering platform designed with strict Region-Based Data Isolation (ReBAC) and Role-Based Access Control (RBAC) using a modern Monorepo architecture.

🚀 Features Implemented

🛡️ Access Control

RBAC (Role-Based Access Control):

Admin: Full access to all features and regions. Can manage global payment methods.

Manager: Can view and pay for orders, but strictly limited to their assigned region.

Member: Can view and create orders, but strictly limited to their assigned region. Cannot pay.

ReBAC (Region-Based Access Control) [Bonus Objective]:

Data is filtered at the database level.

A Manager in the USA cannot view, edit, or pay for orders/restaurants in India.

Backend Services strictly enforce this isolation, returning 403 Forbidden if cross-region attempts are made.

💎 User Experience

Persistent Cart: Shopping cart state is preserved across page reloads (LocalStorage).

Optimistic UI: Toast notifications and Skeleton loaders for seamless interaction.

Responsive Design: Mobile-first UI using Tailwind CSS.

🛠️ Tech Stack

Architecture: Monorepo (pnpm workspaces)

Layer

Technology

Frontend

Next.js 14 (App Router), Apollo Client v3, Tailwind CSS

Backend

NestJS, GraphQL (Code-First), Prisma ORM, Passport JWT

Database

PostgreSQL

DevOps

Docker (for DB), pnpm

⚙️ Getting Started

Follow these instructions to set up the project locally.

1. Prerequisites

Node.js (v18 or higher)

pnpm (npm install -g pnpm)

PostgreSQL (Running locally or via Docker on port 5432)

2. Installation

Clone the repository and install dependencies from the root:

git clone [https://github.com/YOUR_USERNAME/slooze-food.git](https://github.com/YOUR_USERNAME/slooze-food.git)
cd slooze-food
pnpm install

3. Environment Setup (Backend)

Navigate to the backend application to configure environment variables:

cd apps/backend
cp .env.example .env

Note: Open .env and ensure DATABASE_URL matches your local PostgreSQL credentials.
Default: postgresql://postgres:postgres@localhost:5432/slooze_db?schema=public

4. Database Migration & Seeding

Run the following command inside apps/backend to create the database schema and seed the initial users/data:

# This runs migrations and executes the seed script automatically

npx prisma migrate dev --name init

🖥️ Running the Application

This project uses a unified start script. You can run both the Frontend and Backend simultaneously from the root directory.

Development Mode

# Ensure you are in the root directory

pnpm dev

Frontend: http://localhost:3000

Backend API: http://localhost:3001/graphql

Production Build

pnpm build
pnpm start

🧪 Testing Guide (Login Credentials)

The database is pre-seeded with the following users to test the RBAC/ReBAC logic as per the problem statement.

1. Admin (Global Access)

Email: nick@slooze.xyz

Password: slooze123

** Capabilities:** View all regions, Create Payment Methods.

2. Manager (USA Region)

Email: cap@slooze.xyz (Captain America)

Password: slooze123

Region: AMERICA

Capabilities: Can View/Pay USA orders. Cannot see India data.

3. Member (India Region)

Email: thanos@slooze.xyz

Password: slooze123

Region: INDIA

Capabilities: Can Create orders in India. Cannot Pay.

Recommended Test Scenarios

Security Block: Log in as Thanos (Member), create an order, and attempt to click "Pay". The system will reject the request.

Data Isolation: Log in as Captain America. You will only see USA restaurants.

Cart Persistence: Add items to the cart as any user and refresh the page.

📂 Project Structure

.
├── apps
│ ├── backend # NestJS API (Port 3001)
│ └── frontend # Next.js App (Port 3000)
├── package.json # Monorepo configuration
└── pnpm-workspace.yaml
