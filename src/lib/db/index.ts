import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
    throw new Error(
        'DATABASE_URL is not set. Please create a .env.local file with your Neon PostgreSQL connection string. ' +
        'See .env.local.example for template or README.md for setup instructions.'
    );
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
