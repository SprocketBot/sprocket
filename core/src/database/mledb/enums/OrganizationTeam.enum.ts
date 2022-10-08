export enum MLE_OrganizationTeam {
    MLEDB_ADMIN = 0,
    LEADERSHIP = 1,
    COUNCIL = 2,
    COORDINATOR = 3,
    LEAGUE_OPERATIONS = 4,
    PRODUCTION = 5,
    MODERATORS = 6,
    COMMUNITY = 7,
    MARKETING = 8,
    STATISTICS = 9,
    SPONSORSHIP = 10,
    AFFILIATE_BROADCASTER = 11,
}

export function organizationTeamToString(
    organizationTeam: MLE_OrganizationTeam,
): string {
    switch (organizationTeam) {
        case MLE_OrganizationTeam.MLEDB_ADMIN:
            return "MLEDB Admin";
        case MLE_OrganizationTeam.LEADERSHIP:
            return "Leadership";
        case MLE_OrganizationTeam.COUNCIL:
            return "Council";
        case MLE_OrganizationTeam.COORDINATOR:
            return "Coordinator";
        case MLE_OrganizationTeam.LEAGUE_OPERATIONS:
            return "League Operations";
        case MLE_OrganizationTeam.PRODUCTION:
            return "Production";
        case MLE_OrganizationTeam.MODERATORS:
            return "Moderators";
        case MLE_OrganizationTeam.COMMUNITY:
            return "Community";
        case MLE_OrganizationTeam.MARKETING:
            return "Marketing";
        case MLE_OrganizationTeam.STATISTICS:
            return "Statistics";
        case MLE_OrganizationTeam.SPONSORSHIP:
            return "Sponsorship";
        case MLE_OrganizationTeam.AFFILIATE_BROADCASTER:
            return "Affiliate Broadcaster";
        default:
            return "Nobody";
    }
}
