import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';
import { eq, and, SQL } from 'drizzle-orm';
import { members } from '@/lib/db/schema/members';

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

interface MemberLocation {
    state: string;
    city: string;
    zone?: string | null;
    nucleusId?: string | null;
}

export function canManageMember(
    user: JWTPayload | null,
    member: MemberLocation
): boolean {
    if (!user) return false;

    if (user.role === 'ADMIN') return true;

    if (user.role === 'STATE_COORD') {
        return user.scopeState === member.state;
    }

    if (user.role === 'CITY_COORD') {
        return user.scopeState === member.state &&
            user.scopeCity === member.city;
    }

    if (user.role === 'ZONE_COORD') {
        return user.scopeState === member.state &&
            user.scopeCity === member.city &&
            user.scopeZone === member.zone;
    }

    if (user.role === 'LOCAL_COORD') {
        return user.scopeNucleusId != null &&
            user.scopeNucleusId === member.nucleusId;
    }

    return false;
}

export function buildMemberScopeFilter(user: JWTPayload): SQL | undefined | null {
    if (user.role === 'ADMIN') return undefined;

    if (user.role === 'STATE_COORD') {
        return eq(members.state, user.scopeState || '');
    }

    if (user.role === 'CITY_COORD') {
        return and(
            eq(members.state, user.scopeState || ''),
            eq(members.city, user.scopeCity || '')
        );
    }

    if (user.role === 'ZONE_COORD') {
        return and(
            eq(members.state, user.scopeState || ''),
            eq(members.city, user.scopeCity || ''),
            eq(members.zone, user.scopeZone || '')
        );
    }

    if (user.role === 'LOCAL_COORD') {
        if (!user.scopeNucleusId) return null;
        return eq(members.nucleusId, user.scopeNucleusId);
    }

    return null;
}
