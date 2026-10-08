import { PrismaClient, Role, TicketPriority, TicketStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up existing data to avoid duplicates
  await prisma.ticketActivity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Hashed passwords for all seed users
  const saltRounds = 10;
  const defaultPasswordHash = await bcrypt.hash('password123', saltRounds);

  // create a tenant organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Bimbo Organization',
      slug: 'bimbo-corp',
    },
  });

  // create users
  const admin = await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: 'admin@bimbo.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Lizbeth',
      lastName: 'Admin',
      role: Role.ADMIN,
    },
  });

  const agent = await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: 'agent@bimbo.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Fernando',
      lastName: 'Agent',
      role: Role.AGENT,
    },
  });

  const customer = await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: 'customer@bimbo.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Juan',
      lastName: 'Customer',
      role: Role.CUSTOMER,
    },
  });

  // Create simple ticket
  await prisma.ticket.create({
    data: {
      organizationId: organization.id,
      creatorId: customer.id,
      title: 'Cannot access my billing dashboard',
      description: 'Whenever I try to click on the billing tab, I get a 500 internal server error.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
    },
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });