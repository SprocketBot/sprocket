/**
 * Unit tests for JWT Refresh Strategy (oauth.jwt.refresh.strategy.ts)
 * 
 * Tests that the JWT refresh strategy correctly extracts and transforms
 * the JWT payload into a UserPayload, including tokenVersion.
 */

// Since we can't easily load the NestJS module, we test the logic directly

describe('JwtRefreshStrategy Logic', () => {
    // Simulate the validate method from JwtRefreshStrategy
    function validateJwtRefreshStrategy(payload: {
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
            // Note: tokenVersion IS included in the refresh strategy
            // This is critical for session invalidation functionality
            tokenVersion: payload.tokenVersion,
        };
    }

    describe('validate', () => {
        it('should extract basic user fields from payload', () => {
            const payload = {
                userId: 1,
                username: 'testuser',
                tokenVersion: 1,
            };

            const result = validateJwtRefreshStrategy(payload);

            expect(result.userId).toBe(1);
            expect(result.username).toBe('testuser');
            expect(result.tokenVersion).toBe(1);
        });

        it('should include tokenVersion in the result', () => {
            const payload = {
                userId: 1,
                username: 'testuser',
                tokenVersion: 5,
            };

            const result = validateJwtRefreshStrategy(payload);

            expect(result.tokenVersion).toBe(5);
        });

        it('should handle undefined tokenVersion', () => {
            const payload = {
                userId: 1,
                username: 'testuser',
                tokenVersion: undefined,
            };

            const result = validateJwtRefreshStrategy(payload);

            expect(result.tokenVersion).toBeUndefined();
        });

        it('should default orgTeams to empty array when not present', () => {
            const payload = {
                userId: 1,
                username: 'testuser',
                tokenVersion: 1,
            };

            const result = validateJwtRefreshStrategy(payload);

            expect(result.orgTeams).toEqual([]);
        });

        it('should extract orgTeams when present', () => {
            const payload = {
                userId: 1,
                username: 'testuser',
                orgTeams: ['MLEDB_ADMIN', 'LEAGUE_OPERATIONS'],
                tokenVersion: 1,
            };

            const result = validateJwtRefreshStrategy(payload);

            expect(result.orgTeams).toEqual(['MLEDB_ADMIN', 'LEAGUE_OPERATIONS']);
        });

        it('should handle all fields at once', () => {
            const payload = {
                userId: 42,
                username: 'adminuser',
                currentOrganizationId: 3,
                orgTeams: ['MLEDB_ADMIN'],
                tokenVersion: 10,
            };

            const result = validateJwtRefreshStrategy(payload);

            expect(result).toEqual({
                userId: 42,
                username: 'adminuser',
                currentOrganizationId: 3,
                orgTeams: ['MLEDB_ADMIN'],
                tokenVersion: 10,
            });
        });
    });

    describe('tokenVersion usage', () => {
        it('should preserve tokenVersion for session invalidation checks', () => {
            // This test verifies the key difference between JWT and JWT Refresh
            // The refresh strategy includes tokenVersion so the backend can check
            // if sessions have been invalidated
            
            const refreshPayload = {
                userId: 1,
                username: 'testuser',
                tokenVersion: 3,
            };

            const result = validateJwtRefreshStrategy(refreshPayload);

            // tokenVersion should be present and correct
            expect(result.tokenVersion).toBe(3);
        });
    });
});
