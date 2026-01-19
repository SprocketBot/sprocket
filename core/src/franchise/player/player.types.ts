import { createUnionType, Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { z } from 'zod';

import { Player } from '../../database/franchise/player/player.model';
import { League, ModePreference, Timezone } from '../../database/mledb';
export interface GameAndOrganization {
  gameId: number;
  organizationId: number;
}

@InputType()
export class CreatePlayerTuple {
  @Field(() => Int)
  gameSkillGroupId: number;

  @Field(() => Float)
  salary: number;
}

export const IntakeSchema = z
  .object({
    discordId: z.preprocess(val => String(val), z.string()),
    name: z.string(),
    skillGroup: z.nativeEnum(League),
    salary: z.preprocess(val => parseFloat(String(val)), z.number()),
    preferredPlatform: z.enum(['PC', 'XB1', 'PS4']),
    timezone: z.nativeEnum(Timezone),
    preferredMode: z.nativeEnum(ModePreference),
  })
  .passthrough()
  .transform(data => {
    const {
      discordId,
      name,
      skillGroup,
      salary,
      preferredPlatform,
      timezone,
      preferredMode,
      ...rest
    } = data;
    const accounts = Object.values(rest).filter(a => typeof a === 'string' && a !== '');
    return {
      discordId,
      name,
      skillGroup,
      salary,
      preferredPlatform,
      timezone,
      preferredMode,
      accounts: accounts as string[],
    };
  });

export const RankdownJwtPayloadSchema = z.object({
  playerId: z.number(),
  salary: z.number(),
  skillGroupId: z.number(),
});

export type RankdownJwtPayload = z.infer<typeof RankdownJwtPayloadSchema>;

export const EloRedistributionSchema = z.array(
  z
    .tuple([z.string(), z.string(), z.string()])
    .rest(z.string())
    .transform(([playerId, salary, newElo]) => ({
      playerId: parseInt(playerId),
      salary: parseFloat(salary),
      newElo: parseFloat(newElo),
    })),
);

export const changeSkillGroupSchema = z.object({
  playerId: z.preprocess(val => Number(val), z.number().int().positive()),

  // Note: Salary might need to handle decimals, so we don't use .int()
  salary: z.preprocess(val => Number(val), z.number().positive()),

  skillGroupId: z.preprocess(val => Number(val), z.number().int().positive()),
});
export const IntakeUserBulkSchema = z.object({
  name: z.string(),
  discordId: z.preprocess(val => String(val), z.string()),
  skillGroupId: z.preprocess(val => parseInt(String(val)), z.number().int()),
  salary: z.preprocess(val => parseFloat(String(val)), z.number()),
});

// Operation Error Type for Union Results
@ObjectType()
export class OperationError {
  @Field(() => String)
  message: string;

  @Field(() => Int, { nullable: true })
  code?: number;

  constructor(message: string, code?: number) {
    this.message = message;
    this.code = code;
  }
}

// Union Types for Mutation Results
export const ChangePlayerSkillGroupResult = createUnionType({
  name: 'ChangePlayerSkillGroupResult',
  types: () => [Player, OperationError],
  resolveType: value => {
    if (value instanceof OperationError) return OperationError;
    return Player;
  },
});

export const IntakeUserResult = createUnionType({
  name: 'IntakeUserResult',
  types: () => [Player, OperationError],
  resolveType: value => {
    if (value instanceof OperationError) return OperationError;
    return Player;
  },
});

export const SwapDiscordAccountsResult = createUnionType({
  name: 'SwapDiscordAccountsResult',
  types: () => [OperationError],
  resolveType: value => OperationError,
});

export const ForcePlayerToTeamResult = createUnionType({
  name: 'ForcePlayerToTeamResult',
  types: () => [OperationError],
  resolveType: value => OperationError,
});

export const ChangePlayerNameResult = createUnionType({
  name: 'ChangePlayerNameResult',
  types: () => [OperationError],
  resolveType: value => OperationError,
});

export const CreatePlayerResult = createUnionType({
  name: 'CreatePlayerResult',
  types: () => [Player, OperationError],
  resolveType: value => {
    if (value instanceof OperationError) return OperationError;
    return Player;
  },
});
