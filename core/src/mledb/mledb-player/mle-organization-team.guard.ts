import type { CanActivate, ExecutionContext, Type } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import type { MLE_OrganizationTeam } from '../../database/mledb';
import type { UserPayload } from '../../identity';

// TODO: If someone logs in with something that isn't Discord, their org teams will be undefined
// See src/identity/auth/oauth/oauth.controller.ts - Only gets set on discord authentication

export type OrganizationTeamGuardOptions =
  | MLE_OrganizationTeam
  | MLE_OrganizationTeam[]
  | ((orgTeams: MLE_OrganizationTeam[]) => boolean);

/**
 * Verifies a player has the correct MLE organization teams.
 * @param {OrganizationTeamGuardOptions} organizationTeamGuardOptions Either an MLE Organization Team, array of Organization Teams (only requires one), or a function that takes the user's organization teams and returns a boolean.
 * @returns {Type<CanActivate>} The organization team guard.
 *
 * @example
 * ```js
 * \@UseGuards(MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
 * async function doSomethingRisky(): Promise<void> {}
 * ```
 *
 * @example
 * ```js
 * \@UseGuards(MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
 * async function doSomethingRisky(): Promise<void> {}
 * ```
 *
 * @example
 * ```js
 * \@UseGuards(MLEOrganizationTeamGuard(orgTeams => orgTeams.includes(MLE_OrganizationTeam.MLEDB_ADMIN)))
 * async function doSomethingRisky(): Promise<void> {}
 * ```
 */
export function MLEOrganizationTeamGuard(
  organizationTeams: OrganizationTeamGuardOptions,
): Type<CanActivate> {
  @Injectable()
  class _MLEOrganizationTeamGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const ctx = GqlExecutionContext.create(context);
      const req = ctx.getContext().req;

      // Allow bypassing org team check in test mode for local development
      // IMPORTANT: This should ONLY be enabled in local development, never in production
      if (process.env.ENABLE_TEST_MODE === 'true' && req.headers['x-test-mode'] === 'true') {
        // Test mode user already has all org teams injected by GqlJwtGuard
        return true;
      }

      const user = req.user as UserPayload;

      if (!user.orgTeams) return false;

      if (organizationTeams instanceof Function) {
        return organizationTeams(user.orgTeams);
      } else if (Array.isArray(organizationTeams)) {
        return organizationTeams.some(orgTeam =>
          user.orgTeams.some(userOrgTeam => userOrgTeam === orgTeam),
        );
      }

      return user.orgTeams.some(orgTeam => orgTeam === organizationTeams);
    }
  }

  return _MLEOrganizationTeamGuard;
}
