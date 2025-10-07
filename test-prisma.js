import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrisma() {
  
  try {
    const users = await prisma.user.findMany();
    console.log('Usuários existentes:', users);
    
    const newUser = await prisma.user.create({
      data: {
        name: 'Teste Usuario',
        email: 'teste@example.com'
      }
    });
    console.log('Usuário criado:', newUser);
    
    const updatedUsers = await prisma.user.findMany();
    console.log('👥 Usuários após criação:', updatedUsers);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
