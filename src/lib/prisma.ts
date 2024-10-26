import { PrismaClient } from '@prisma/client';

const prismaClientSingleTon = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleTon>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleTon();

export default prisma;

if (process.env.NODE_ENV !== "production") global.prismaGlobal = prisma;