jest.mock("../../mledb/mledb-player/mledb-player.service", () => ({
    MledbPlayerService: jest.fn(),
}));

import {MLE_OrganizationTeam} from "../../database/mledb/enums/OrganizationTeam.enum";
import {OrgTeamPermissionResolutionService} from "./org-team-permission-resolution.service";

describe("OrgTeamPermissionResolutionService", () => {
    const originalDualRead = process.env.ORG_TEAM_PERMISSION_DUAL_READ;

    const userOrgTeamPermissionService = {
        listOrgTeamsForUser: jest.fn(),
    };
    const mledbPlayerService = {
        getMlePlayerBySprocketUser: jest.fn(),
        getPlayerOrgs: jest.fn(),
    };

    let service: OrgTeamPermissionResolutionService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new OrgTeamPermissionResolutionService(
            userOrgTeamPermissionService as never,
            mledbPlayerService as never,
        );
    });

    afterEach(() => {
        process.env.ORG_TEAM_PERMISSION_DUAL_READ = originalDualRead;
    });

    it("returns Sprocket permissions without consulting MLEDB when dual-read is disabled", async () => {
        process.env.ORG_TEAM_PERMISSION_DUAL_READ = "false";
        userOrgTeamPermissionService.listOrgTeamsForUser.mockResolvedValue([
            MLE_OrganizationTeam.COORDINATOR,
        ]);

        const result = await service.resolveOrgTeamsForUser(42);

        expect(result).toEqual([MLE_OrganizationTeam.COORDINATOR]);
        expect(mledbPlayerService.getMlePlayerBySprocketUser).not.toHaveBeenCalled();
        expect(mledbPlayerService.getPlayerOrgs).not.toHaveBeenCalled();
    });

    it("returns the union of Sprocket and legacy permissions while dual-read is enabled", async () => {
        process.env.ORG_TEAM_PERMISSION_DUAL_READ = "true";
        userOrgTeamPermissionService.listOrgTeamsForUser.mockResolvedValue([
            MLE_OrganizationTeam.COORDINATOR,
        ]);
        mledbPlayerService.getMlePlayerBySprocketUser.mockResolvedValue({id: 7});
        mledbPlayerService.getPlayerOrgs.mockResolvedValue([
            {orgTeam: MLE_OrganizationTeam.LEAGUE_OPERATIONS},
            {orgTeam: MLE_OrganizationTeam.COORDINATOR},
        ]);

        const result = await service.resolveOrgTeamsForUser(42);

        expect(result).toEqual([
            MLE_OrganizationTeam.COORDINATOR,
            MLE_OrganizationTeam.LEAGUE_OPERATIONS,
        ]);
    });

    it("keeps Sprocket permissions when the legacy lookup fails during dual-read", async () => {
        process.env.ORG_TEAM_PERMISSION_DUAL_READ = "true";
        userOrgTeamPermissionService.listOrgTeamsForUser.mockResolvedValue([
            MLE_OrganizationTeam.LEAGUE_OPERATIONS,
        ]);
        mledbPlayerService.getMlePlayerBySprocketUser.mockRejectedValue(new Error("no linked MLE player"));

        const result = await service.resolveOrgTeamsForUser(42);

        expect(result).toEqual([MLE_OrganizationTeam.LEAGUE_OPERATIONS]);
    });
});
