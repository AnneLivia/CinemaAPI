import Prisma from '@prisma/client';
import config from '../config/config.js';

// datasources: Overwrites the datasource url from your prisma.schema file
// config.DATABASE_URL comes from the config.js considering the node_env.
const prismaClient = new Prisma.PrismaClient({
  datasources: {
    db: {
      url: config.DATABASE_URL,
    },
  },
});

export default prismaClient;
