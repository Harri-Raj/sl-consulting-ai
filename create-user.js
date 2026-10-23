const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('demo123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'consultant@slconsulting.demo' },
    update: { password: hashedPassword },
    create: {
      email: 'consultant@slconsulting.demo',
      name: 'Demo Consultant',
      password: hashedPassword,
      role: 'CONSULTANT',
    },
  });

  console.log('✅ User created:', user.email);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });