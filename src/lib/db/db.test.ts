import { describe, it, expect } from 'vitest';
import { db } from './index';
import { sql } from 'drizzle-orm';

describe('Database Connectivity', () => {
    it('should connect to the database and run a simple query', async () => {
        try {
            const result = await db.execute(sql`SELECT 1 as connected`);
            expect(result).toBeDefined();
            // @ts-ignore - drizzle result structure varies by driver
            expect(result.rows[0].connected).toBe(1);
        } catch (error) {
            console.error('Database connection failed:', error);
            throw error;
        }
    });
});
