import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        return null;
    }

    return await verifyToken(token);
}

export function hasRole(
    user: JWTPayload | null,
    allowedRoles: JWTPayload['role'][]
): boolean {
    if (!user) return false;
    return allowedRoles.includes(user.role);
}

export function canAccessTerritory(
    user: JWTPayload | null,
    targetState?: string,
    targetCity?: string
): boolean {
    if (!user) return false;

    // National admin can access everything
    if (user.role === 'national_admin') return true;

    if (!user.territoryScope) return false;

    const [userState, userCity] = user.territoryScope.split(':');

    // State leader can access their state
    if (user.role === 'state_leader' && targetState === userState) {
        return true;
    }

    // Municipal leader can access their city
    if (user.role === 'municipal_leader' && targetState === userState && targetCity === userCity) {
        return true;
    }

    return false;
}
