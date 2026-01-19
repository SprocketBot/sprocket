#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Entity mapping: entity name -> folder path relative to database/
const entityMap = {
  // Franchise entities
  Franchise: 'franchise/franchise/franchise.model',
  FranchiseGroup: 'franchise/franchise_group/franchise_group.model',
  FranchiseGroupAssignment: 'franchise/franchise_group_assignment/franchise_group_assignment.model',
  FranchiseGroupProfile: 'franchise/franchise_group_profile/franchise_group_profile.model',
  FranchiseGroupType: 'franchise/franchise_group_type/franchise_group_type.model',
  FranchiseLeadershipAppointment:
    'franchise/franchise_leadership_appointment/franchise_leadership_appointment.model',
  FranchiseProfile: 'franchise/franchise_profile/franchise_profile.model',
  FranchiseStaffAppointment:
    'franchise/franchise_staff_appointment/franchise_staff_appointment.model',
  GameSkillGroup: 'franchise/game_skill_group/game_skill_group.model',
  GameSkillGroupProfile: 'franchise/game_skill_group_profile/game_skill_group_profile.model',
  Player: 'franchise/player/player.model',
  RosterRole: 'franchise/roster_role/roster_role.model',
  RosterRoleUsage: 'franchise/roster_role_usages/roster_role_usages.model',
  RosterRoleUseLimits: 'franchise/roster_role_use_limits/roster_role_use_limits.model',
  RosterSlot: 'franchise/roster_slot/roster_slot.model',
  Team: 'franchise/team/team.model',

  // Game entities
  EnabledFeature: 'game/enabled_feature/enabled_feature.model',
  Feature: 'game/feature/feature.model',
  FeatureCode: 'game/feature/feature.enum',
  Game: 'game/game/game.model',
  GameFeature: 'game/game_feature/game_feature.model',
  GameMode: 'game/game_mode/game_mode.model',
  Platform: 'game/platform/platform.model',

  // Organization entities
  Approval: 'organization/approval/approval.model',
  Member: 'organization/member/member.model',
  MemberPlatformAccount: 'organization/member_platform_account/member_platform_account.model',
  MemberProfile: 'organization/member_profile/member_profile.model',
  MemberRestriction: 'organization/member_restriction/member_restriction.model',
  MemberRestrictionType: 'organization/member_restriction/member_restriction_type.enum',
  Organization: 'organization/organization/organization.model',
  OrganizationMottos: 'organization/organization_mottos/organization_mottos.model',
  OrganizationProfile: 'organization/organization_profile/organization_profile.model',
  Photo: 'organization/photo/photo.model',
  Pronouns: 'organization/pronouns/pronouns.model',

  // Scheduling entities
  EligibilityData: 'scheduling/eligibility_data/eligibility_data.model',
  Invalidation: 'scheduling/invalidation/invalidation.model',
  Match: 'scheduling/match/match.model',
  MatchParent: 'scheduling/match_parent/match_parent.model',
  PlayerStatLine: 'scheduling/player_stat_line/player_stat_line.model',
  PlayerStatLineStatsSchema: 'scheduling/player_stat_line/player_stat_line.schema',
  Round: 'scheduling/round/round.model',
  ScrimMeta: 'scheduling/saved_scrim/scrim.model',
  ScheduleFixture: 'scheduling/schedule_fixture/schedule_fixture.model',
  ScheduleGroup: 'scheduling/schedule_group/schedule_group.model',
  ScheduleGroupType: 'scheduling/schedule_group_type/schedule_group_type.model',
  ScheduledEvent: 'scheduling/scheduled_event/scheduled_event.model',
  TeamStatLine: 'scheduling/team_stat_line/team_stat_line.model',

  // Identity entities
  User: 'identity/user/user.model',
  UserAuthenticationAccount:
    'identity/user_authentication_account/user_authentication_account.model',
  UserAuthenticationAccountType:
    'identity/user_authentication_account/user_authentication_account_type.enum',
  UserProfile: 'identity/user_profile/user_profile.model',
  UserRoles: 'identity/roles/user_roles.model',
  UserRolesType: 'identity/roles/user_roles_type.enum',

  // Image generation entities
  ImageTemplate: 'image-gen/image_template/image_template.model',

  // Configuration entities
  OrganizationConfigurationKeyCode:
    'configuration/organization_configuration_key/organization_configuration_key.enum',
  OrganizationConfigurationKey:
    'configuration/organization_configuration_key/organization_configuration_key.model',
  OrganizationConfigurationKeyTypes:
    'configuration/organization_configuration_key/organization_configuration_key.enum',
  OrganizationConfigurationValue:
    'configuration/organization_configuration_value/organization_configuration_value.model',
  OrganizationConfigurationAllowedValue:
    'configuration/organization_configuration_allowed_value/organization_configuration_allowed_value.model',
  SprocketConfiguration: 'configuration/sprocket_configuration/sprocket_configuration.model',
  Verbiage: 'configuration/verbiage/verbiage.model',
  VerbiageCode: 'configuration/verbiage_code/verbiage_code.model',

  // Webhook entities
  Webhook: 'webhook/webhook/webhook.model',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: imports from "../../database" or "../database" or similar
  const databaseImportRegex = /from\s+['"](\.\.\/)*database['"]/g;
  const matches = content.match(databaseImportRegex);

  if (matches) {
    // Extract all imports from database
    const importRegex = /import\s+(?:type\s+)?{([^}]+)}\s+from\s+['"]((\.\.\/)+)database['"]/g;
    content = content.replace(importRegex, (match, imports, fullPath) => {
      const importList = imports
        .split(',')
        .map(i => i.trim())
        .filter(i => i);
      const newImports = [];

      importList.forEach(importName => {
        // Handle "type Foo" syntax
        const typeMatch = importName.match(/^type\s+(\w+)$/);
        const entityName = typeMatch ? typeMatch[1] : importName;

        if (entityMap[entityName]) {
          const prefix = typeMatch ? 'type ' : '';
          newImports.push(`import ${prefix}{${entityName}} from '$db/${entityMap[entityName]}';`);
        } else {
          // Keep original if not in our map (might be from other modules)
          newImports.push(`import {${importName}} from '${fullPath}database';`);
        }
      });

      modified = true;
      return newImports.join('\n');
    });
  }

  // Pattern 2: imports from module barrel files within database directory
  // Match patterns like: "../../organization", "../../franchise", "../../game"
  const moduleBarrelRegex =
    /import\s+(?:type\s+)?{([^}]+)}\s+from\s+['"](\.\.\/)+([a-z_-]+)['"];?/g;
  const matches2 = content.match(moduleBarrelRegex);

  if (matches2) {
    content = content.replace(moduleBarrelRegex, (match, relativePath, moduleName) => {
      const importList = match
        .match(/{([^}]+)}/)[1]
        .split(',')
        .map(i => i.trim())
        .filter(i => i);
      const newImports = [];

      importList.forEach(importName => {
        const typeMatch = importName.match(/^type\s+(\w+)$/);
        const entityName = typeMatch ? typeMatch[1] : importName;

        if (entityMap[entityName]) {
          const prefix = typeMatch ? 'type ' : '';
          newImports.push(`import ${prefix}{${entityName}} from '$db/${entityMap[entityName]}';`);
          modified = true;
        }
      });

      // If we replaced some imports, return the new ones; otherwise keep original
      return newImports.length > 0 ? newImports.join('\n') : match;
    });
  }

  // Pattern 3: imports from within database folder ONLY
  // Only match paths that are clearly pointing to database subfolder
  // Match patterns like: "../../database/organization" or "../database/scheduling"
  const relativePatterns = [
    {
      regex: /from\s+['"]\.\.\/database\/organization\/organization['"]/g,
      replace: "from '$db/organization/organization/organization.model'",
    },
    {
      regex: /from\s+['"]\.\.\/\.\.\/database\/organization\/organization['"]/g,
      replace: "from '$db/organization/organization/organization.model'",
    },
    {
      regex: /from\s+['"]\.\.\/database\/organization\/member_profile['"]/g,
      replace: "from '$db/organization/member_profile/member_profile.model'",
    },
    {
      regex: /from\s+['"]\.\.\/\.\.\/database\/organization\/member_profile['"]/g,
      replace: "from '$db/organization/member_profile/member_profile.model'",
    },
    {
      regex: /from\s+['"]\.\.\/database\/organization\/pronouns['"]/g,
      replace: "from '$db/organization/pronouns/pronouns.model'",
    },
    {
      regex: /from\s+['"]\.\.\/\.\.\/database\/organization\/pronouns['"]/g,
      replace: "from '$db/organization/pronouns/pronouns.model'",
    },
    {
      regex: /from\s+['"]\.\.\/database\/franchise\/franchise['"]/g,
      replace: "from '$db/franchise/franchise/franchise.model'",
    },
    {
      regex: /from\s+['"]\.\.\/\.\.\/database\/franchise\/franchise['"]/g,
      replace: "from '$db/franchise/franchise/franchise.model'",
    },
    {
      regex: /from\s+['"]\.\.\/database\/scheduling\/schedule_group['"]/g,
      replace: "from '$db/scheduling/schedule_group/schedule_group.model'",
    },
    {
      regex: /from\s+['"]\.\.\/\.\.\/database\/scheduling\/schedule_group['"]/g,
      replace: "from '$db/scheduling/schedule_group/schedule_group.model'",
    },
    {
      regex: /from\s+['"]\.\.\/database\/scheduling\/schedule_group_type['"]/g,
      replace: "from '$db/scheduling/schedule_group_type/schedule_group_type.model'",
    },
    {
      regex: /from\s+['"]\.\.\/\.\.\/database\/scheduling\/schedule_group_type['"]/g,
      replace: "from '$db/scheduling/schedule_group_type/schedule_group_type.model'",
    },
    {
      regex: /from\s+['"]\.\.\/database\/scheduling\/schedule_fixture['"]/g,
      replace: "from '$db/scheduling/schedule_fixture/schedule_fixture.model'",
    },
    {
      regex: /from\s+['"]\.\.\/\.\.\/database\/scheduling\/schedule_fixture['"]/g,
      replace: "from '$db/scheduling/schedule_fixture/schedule_fixture.model'",
    },
  ];

  relativePatterns.forEach(({ regex, replace }) => {
    if (regex.test(content)) {
      content = content.replace(regex, replace);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated: ${filePath}`);
    return true;
  }

  return false;
}

function walkDirectory(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      count += walkDirectory(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts') && !file.endsWith('.d.ts')) {
      if (processFile(filePath)) {
        count++;
      }
    }
  });

  return count;
}

const srcDir = path.join(__dirname, 'src');
console.log('Fixing imports in', srcDir);
const count = walkDirectory(srcDir);
console.log(`\nUpdated ${count} files`);
