import type { ModelLifecycleFields } from "./base-model";

export * from "./authorization";
export * from "./configuration";
export * from "./database.module";
export * from "./draft";
export * from "./franchise/franchise.module";
export * from "./game/game.module";
export * from "./identity";
export * from "./image-gen";
export * from "./organization/organization.module";
export * from "./scheduling/scheduling.module";

// Export enums that are used as values (not just types)
export { OrganizationConfigurationKeyCode, OrganizationConfigurationKeyType } from "./configuration/organization_configuration_key/organization_configuration_key.enum";
export { FeatureCode } from "./game/feature/feature.enum";
export { MemberRestrictionType } from "./organization/member_restriction/member_restriction_type.enum";
export { UserAuthenticationAccountType } from "./identity/user_authentication_account/user_authentication_account_type.enum";
export { VerbiageCode } from "./configuration/verbiage_code/verbiage_code.model";

// Export commonly used models
export { User } from "./identity/user/user.model";
export { Player } from "./franchise/player/player.model";
export { OrganizationProfile } from "./organization/organization_profile/organization_profile.model";
export { FranchiseProfile } from "./franchise/franchise_profile/franchise_profile.model";
export { GameSkillGroupProfile } from "./franchise/game_skill_group_profile/game_skill_group_profile.model";
export { EnabledFeature } from "./game/enabled_feature/enabled_feature.model";
export { Verbiage } from "./configuration/verbiage/verbiage.model";
export { MemberRestriction } from "./organization/member_restriction/member_restriction.model";
export { Member } from "./organization/member/member.model";
export { Organization } from "./organization/organization/organization.model";
export { Franchise } from "./franchise/franchise/franchise.model";
export { GameMode } from "./game/game_mode/game_mode.model";
export { GameSkillGroup } from "./franchise/game_skill_group/game_skill_group.model";
export { Match } from "./scheduling/match/match.model";
export { MatchParent } from "./scheduling/match_parent/match_parent.model";
export { ScheduleFixture } from "./scheduling/schedule_fixture/schedule_fixture.model";
export { ScheduleGroup } from "./scheduling/schedule_group/schedule_group.model";
export { ScheduleGroupType } from "./scheduling/schedule_group_type/schedule_group_type.model";
export { MemberPlatformAccount } from "./organization/member_platform_account/member_platform_account.model";
export { UserAuthenticationAccount } from "./identity/user_authentication_account/user_authentication_account.model";
export { SprocketConfiguration } from "./configuration/sprocket_configuration/sprocket_configuration.model";
export { OrganizationConfigurationAllowedValue } from "./configuration/organization_configuration_allowed_value/organization_configuration_allowed_value.model";
export { MemberProfile } from "./organization/member_profile/member_profile.model";
export { Photo } from "./organization/photo/photo.model";
export { Pronouns } from "./organization/pronouns/pronouns.model";
export { DatabaseModule } from "./database.module";
export { Team } from "./franchise/team/team.model";
export { RosterRole } from "./franchise/roster_role/roster_role.model";
export { RosterSlot } from "./franchise/roster_slot/roster_slot.model";
export { UserProfile } from "./identity/user_profile/user_profile.model";
export { FranchiseGroup } from "./franchise/franchise_group/franchise_group.model";
export { FranchiseGroupProfile } from "./franchise/franchise_group_profile/franchise_group_profile.model";
export { FranchiseGroupType } from "./franchise/franchise_group_type/franchise_group_type.model";
export { FranchiseGroupAssignment } from "./franchise/franchise_group_assignment/franchise_group_assignment.model";
export { FranchiseStaffAppointment } from "./franchise/franchise_staff_appointment/franchise_staff_appointment.model";
export { PlayerStatLine } from "./scheduling/player_stat_line/player_stat_line.model";
export { PlayerStatLineStatsSchema } from "./scheduling/player_stat_line/player_stat_line.schema";
export { Round } from "./scheduling/round/round.model";
export { EligibilityData } from "./scheduling/eligibility_data/eligibility_data.model";
export { ScheduledEvent } from "./scheduling/scheduled_event/scheduled_event.model";
export { Invalidation } from "./scheduling/invalidation/invalidation.model";
export { ImageTemplate } from "./image-gen/image_template/image_template.model";
export { ScrimMeta } from "./scheduling/saved_scrim/scrim.model";
export { TeamStatLine } from "./scheduling/team_stat_line/team_stat_line.model";
export { Game } from "./game/game/game.model";

export type TypeOrmFields = "hasId" | "save" | "remove" | "softRemove" | "recover" | "reload";
export type IrrelevantFields = TypeOrmFields | ModelLifecycleFields;
