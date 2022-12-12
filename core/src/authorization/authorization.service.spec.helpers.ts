import type {Member} from "../organization/database/member.entity";

function codeToPermission(code: string): {action: {code: string}} {
    return {action: {code}};
}

export function getMockMember(rolePerms: string[], teamPerms: string[], positionPerms: string[]): Member {
    return {
        id: 1,
        organizationStaffSeats: [
            {
                position: {
                    role: {bearer: {permissions: rolePerms.map(p => codeToPermission(p))}},
                    team: {
                        bearer: {permissions: teamPerms.map(p => codeToPermission(p))},
                    },
                    bearer: {permissions: positionPerms.map(p => codeToPermission(p))},
                },
            },
        ],
    } as Member;
}
