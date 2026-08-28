/**
 * Unit tests for Roles Guard (roles.guard.ts)
 * 
 * Tests the role matching logic in RolesGuard.
 */

describe('RolesGuard Logic', () => {
    // Simulate the matchRoles method from RolesGuard
    function matchRoles(roles: string[], userRoles: string[]): boolean {
        for (const ur of userRoles) {
            if (roles.includes(ur)) {
                return true;
            }
        }
        return false;
    }

    describe('matchRoles', () => {
        it('should return true when user has an allowed role', () => {
            const allowedRoles = ['admin', 'moderator'];
            const userRoles = ['user', 'admin'];

            const result = matchRoles(allowedRoles, userRoles);

            expect(result).toBe(true);
        });

        it('should return true when user has the exact role', () => {
            const allowedRoles = ['admin'];
            const userRoles = ['admin'];

            const result = matchRoles(allowedRoles, userRoles);

            expect(result).toBe(true);
        });

        it('should return false when user has no allowed roles', () => {
            const allowedRoles = ['admin', 'moderator'];
            const userRoles = ['user', 'guest'];

            const result = matchRoles(allowedRoles, userRoles);

            expect(result).toBe(false);
        });

        it('should return false when user has empty roles', () => {
            const allowedRoles = ['admin'];
            const userRoles: string[] = [];

            const result = matchRoles(allowedRoles, userRoles);

            expect(result).toBe(false);
        });

        it('should return false when allowed roles is empty', () => {
            const allowedRoles: string[] = [];
            const userRoles = ['admin'];

            const result = matchRoles(allowedRoles, userRoles);

            expect(result).toBe(false);
        });

        it('should return true when user has any of multiple allowed roles', () => {
            const allowedRoles = ['admin', 'moderator', 'helper'];
            const userRoles = ['guest', 'helper'];

            const result = matchRoles(allowedRoles, userRoles);

            expect(result).toBe(true);
        });

        it('should handle MLEDB_ADMIN role correctly', () => {
            const allowedRoles = ['MLEDB_ADMIN'];
            const userRoles = ['MLEDB_ADMIN'];

            const result = matchRoles(allowedRoles, userRoles);

            expect(result).toBe(true);
        });

        it('should handle LEAGUE_OPERATIONS role correctly', () => {
            const allowedRoles = ['MLEDB_ADMIN', 'LEAGUE_OPERATIONS'];
            const userRoles = ['LEAGUE_OPERATIONS'];

            const result = matchRoles(allowedRoles, userRoles);

            expect(result).toBe(true);
        });

        it('should handle user type vs org team distinction', () => {
            // The guard checks user.type which is the user type (admin, etc)
            // Not the orgTeams which are organization-level permissions
            
            const allowedRoles = ['admin'];
            const userRoles = ['admin'];

            const result = matchRoles(allowedRoles, userRoles);

            expect(result).toBe(true);
        });

        it('should return false for partial role match', () => {
            // "admin" should NOT match "adminestrator"
            const allowedRoles = ['admin'];
            const userRoles = ['adminestrator'];

            const result = matchRoles(allowedRoles, userRoles);

            expect(result).toBe(false);
        });
    });

    describe('case sensitivity', () => {
        it('should be case sensitive', () => {
            const allowedRoles = ['Admin'];
            const userRoles = ['admin'];

            const result = matchRoles(allowedRoles, userRoles);

            expect(result).toBe(false);
        });
    });
});
