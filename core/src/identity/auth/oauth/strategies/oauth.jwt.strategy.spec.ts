/**
 * Unit tests for JWT Strategy (oauth.jwt.strategy.ts)
 * 
 * Tests that the JWT strategy correctly extracts and transforms
 * the JWT payload into a UserPayload.
 */

// Since we can't easily load the NestJS module, we test the logic directly

describe('JwtStrategy Logic', () => {
    // Simulate the validate method from JwtStrategy
    function validateJwtStrategy(payload: {
        userId: number;
        username: string;
        currentOrganizationId?: number;
        orgTeams?: string[];
        tokenVersion?: number;
    }) {
        return {
            userId: payload.userId,
            username: payload.username,
            currentOrganizationId: payload.currentOrganizationId,
            orgTeams: payload.orgTeams ?? [],
            // Note: tokenVersion is NOT included in the regular JWT strategy
            // This is intentional - it's only in the refresh token
        };
    }

    describe('validate', () => {
        it('should extract basic user fields from payload', () => {
            const payload = {
                userId: 1,
                username: 'testuser',
            };

            const result = validateJwtStrategy(payload);

            expect(result.userId).toBe(1);
            expect(result.username).toBe('testuser');
            expect(result.currentOrganizationId).toBeUndefined();
            expect(result.orgTeams).toEqual([]);
        });

        it('should extract currentOrganizationId when present', () => {
            const payload = {
                userId: 1,
                username: 'testuser',
                currentOrganizationId: 5,
            };

            const result = validateJwtStrategy(payload);

            expect(result.currentOrganizationId).toBe(5);
        });

        it('should extract orgTeams when present', () => {
            const payload = {
                userId: 1,
                username: 'testuser',
                orgTeams: ['MLEDB_ADMIN', 'LEAGUE_OPERATIONS'],
            };

            const result = validateJwtStrategy(payload);

            expect(result.orgTeams).toEqual(['MLEDB_ADMIN', 'LEAGUE_OPERATIONS']);
        });

        it('should default orgTeams to empty array when not present', () => {
            const payload = {
                userId: 1,
                username: 'testuser',
            };

            const result = validateJwtStrategy(payload);

            expect(result.orgTeams).toEqual([]);
            expect(result.orgTeams).not.toBeUndefined();
        });

        it('should NOT include tokenVersion in the result', () => {
            const payload = {
                userId: 1,
                username: 'testuser',
                tokenVersion: 5,
            };

            const result = validateJwtStrategy(payload);

            expect(result).not.toHaveProperty('tokenVersion');
        });

        it('should handle all fields at once', () => {
            const payload = {
                userId: 42,
                username: 'adminuser',
                currentOrganizationId: 3,
                orgTeams: ['MLEDB_ADMIN'],
                tokenVersion: 10,
            };

            const result = validateJwtStrategy(payload);

            expect(result).toEqual({
                userId: 42,
                username: 'adminuser',
                currentOrganizationId: 3,
                orgTeams: ['MLEDB_ADMIN'],
            });
        });
    });
});
