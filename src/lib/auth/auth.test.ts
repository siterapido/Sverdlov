import { describe, it, expect, beforeEach } from 'vitest';
import { hashPassword, verifyPassword } from './password';
import { signToken, verifyToken, JWTPayload } from './jwt';

describe('Auth Utility - Password', () => {
    it('should hash and verify password', async () => {
        const password = 'test-password';
        const hashed = await hashPassword(password);
        expect(hashed).not.toBe(password);
        
        const isValid = await verifyPassword(password, hashed);
        expect(isValid).toBe(true);
        
        const isInvalid = await verifyPassword('wrong-password', hashed);
        expect(isInvalid).toBe(false);
    });
});

describe('Auth Utility - JWT', () => {
    it('should sign and verify a token', async () => {
        const payload: JWTPayload = {
            userId: '123',
            email: 'test@example.com',
            role: 'member'
        };
        
        const token = await signToken(payload);
        expect(token).toBeDefined();
        
        const decoded = await verifyToken(token);
        expect(decoded).toMatchObject(payload);
    });

    it('should return null for invalid token', async () => {
        const result = await verifyToken('invalid-token');
        expect(result).toBeNull();
    });
});
