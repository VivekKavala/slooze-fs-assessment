import { PrismaClient, Role, Region } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// 1. Load Environment Variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;

// Debugging
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined. Check your .env file.');
}
if (connectionString.startsWith('prisma+postgres://')) {
  throw new Error(
    "Wrong Protocol: @prisma/adapter-pg requires a 'postgresql://' URL, not 'prisma+postgres://'",
  );
}

// 2. Setup Pool
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('slooze123', 10);
  console.log('🚀 Starting Seeding...');

  const users = [
    // Admin (Global access = null region)
    {
      email: 'nick@slooze.xyz',
      name: 'Nick Fury',
      role: Role.ADMIN,
      region: null,
    },

    // Managers
    {
      email: 'marvel@slooze.xyz',
      name: 'Captain Marvel',
      role: Role.MANAGER,
      region: Region.INDIA,
    },
    {
      email: 'cap@slooze.xyz',
      name: 'Captain America',
      role: Role.MANAGER,
      region: Region.AMERICA,
    },

    // Members
    {
      email: 'thanos@slooze.xyz',
      name: 'Thanos',
      role: Role.MEMBER,
      region: Region.INDIA,
    },
    {
      email: 'thor@slooze.xyz',
      name: 'Thor',
      role: Role.MEMBER,
      region: Region.INDIA,
    },
    {
      email: 'travis@slooze.xyz',
      name: 'Travis',
      role: Role.MEMBER,
      region: Region.AMERICA,
    },
  ];

  for (const user of users) {
    const upsertedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {}, // If exists, change nothing
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        region: user.region,
        password: hashedPassword,
      },
    });
    console.log(
      `✅ Upserted User: ${upsertedUser.name} (${upsertedUser.role})`,
    );
  }

  // ==========================================
  // 2. SEED RESTAURANTS (For ReBAC Testing)
  // ==========================================
  // We need restaurants in specific regions so we can prove that
  // Captain America cannot see "Spicy Hyderabad" and vice-versa.

  const restaurants = [
    {
      name: 'Spicy Hyderabad',
      region: Region.INDIA,
      menu: [
        { name: 'Chicken Biryani', price: 250, category: 'Main Course' },
        { name: 'Paneer 65', price: 180, category: 'Starters' },
      ],
    },
    {
      name: 'Delhi Delights',
      region: Region.INDIA,
      menu: [
        { name: 'Butter Chicken', price: 300, category: 'Main Course' },
        { name: 'Naan', price: 40, category: 'Breads' },
      ],
    },
    {
      name: 'New York Slice',
      region: Region.AMERICA,
      menu: [
        { name: 'Pepperoni Pizza', price: 15.99, category: 'Pizza' },
        { name: 'Garlic Knots', price: 5.99, category: 'Sides' },
      ],
    },
    {
      name: 'Texas BBQ Pit',
      region: Region.AMERICA,
      menu: [
        { name: 'Brisket Sandwich', price: 12.5, category: 'Main Course' },
        { name: 'Ribs', price: 18.0, category: 'Main Course' },
      ],
    },
  ];

  for (const r of restaurants) {
    // Check if restaurant exists first to avoid duplicates
    const existing = await prisma.restaurant.findFirst({
      where: { name: r.name },
    });

    if (!existing) {
      await prisma.restaurant.create({
        data: {
          name: r.name,
          region: r.region,
          menuItems: {
            create: r.menu,
          },
        },
      });
      console.log(`✅ Created Restaurant: ${r.name} [${r.region}]`);
    } else {
      console.log(`ℹ️  Restaurant ${r.name} already exists.`);
    }
  }

  console.log('🎉 Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
