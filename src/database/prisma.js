import Prisma from '@prisma/client';
import config from '../config/config.js';

// datasources: Overwrites the datasource url from your prisma.schema file
// config.DATABASE_URL comes from the config.js considering the node_env.
// info, warn, error are prisma logs
// query is also a level of log which allows us to see the
// queries created by Prisma to perform our operations
const prismaClient = new Prisma.PrismaClient({
  datasources: {
    db: {
      url: config.DATABASE_URL,
    },
  },
  log: ['info'],
});

export default prismaClient;
