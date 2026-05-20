const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith'
    }
  });

  // Create sample tasks
  await prisma.task.create({
    data: {
      title: 'Learn Prisma',
      completed: false
    }
  });

  await prisma.task.create({
    data: {
      title: 'Set up Redis',
      completed: true
    }
  });

  await prisma.task.create({
    data: {
      title: 'Deploy to production',
      completed: false
    }
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
