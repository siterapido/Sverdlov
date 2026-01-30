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

interface NucleusLocation {
    state: string;
    city: string;
    zone?: string | null;
    id: string;
}

export function canManageNucleus(
    user: JWTPayload | null,
    nucleus: NucleusLocation
): boolean {
    if (!user) return false;

    if (user.role === 'ADMIN') return true;

    if (user.role === 'STATE_COORD') {
        return user.scopeState === nucleus.state;
    }

    if (user.role === 'CITY_COORD') {
        return user.scopeState === nucleus.state &&
            user.scopeCity === nucleus.city;
    }

    if (user.role === 'ZONE_COORD') {
        // If the nucleus has no zone but the user covers a zone, strictly speaking they manage that zone.
        // If the nucleus is undefined zone, maybe it's not under their jurisdiction?
        // Assuming strict match:
        return user.scopeState === nucleus.state &&
            user.scopeCity === nucleus.city &&
            user.scopeZone === nucleus.zone;
    }

    if (user.role === 'LOCAL_COORD') {
        return user.scopeNucleusId === nucleus.id;
    }

    return false;
}
