import { Resolver, Mutation, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../auth/current-user/current-user.decorator';
import { UserObject } from '../user/user.object';
import { AuthorizeGuard } from '../../auth/authorize/authorize.guard';
import { ScrimService } from '../../matchmaking/scrim/scrim.service';
import { QueueService } from '../../matchmaking/queue/queue.service';

@Resolver()
@UseGuards(AuthorizeGuard())
export class QueueResolver {
    constructor(
        private readonly scrimService: ScrimService,
        private readonly queueService: QueueService,
    ) { }

    @Mutation(() => Boolean)
    @UseGuards(AuthorizeGuard())
    async joinQueue(
        @CurrentUser() user: UserObject,
        @Args('gameId') gameId: string,
        @Args('skillRating', { type: () => Int }) skillRating: number,
    ): Promise<boolean> {
        try {
            await this.scrimService.joinQueue(user.id, gameId, skillRating);
            return true;
        } catch (error) {
            throw new Error(`Failed to join queue: ${error.message}`);
        }
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthorizeGuard())
    async leaveQueue(
        @CurrentUser() user: UserObject,
    ): Promise<boolean> {
        try {
            return await this.scrimService.leaveQueue(user.id);
        } catch (error) {
            throw new Error(`Failed to leave queue: ${error.message}`);
        }
    }

    @Query(() => QueueStatus, { nullable: true })
    @UseGuards(AuthorizeGuard())
    async getQueueStatus(
        @CurrentUser() user: UserObject,
    ): Promise<QueueStatus | null> {
        try {
            const status = await this.scrimService.getQueueStatus(user.id);
            if (!status) return null;

            return {
                playerId: status.player.id,
                gameId: status.game.id,
                skillRating: status.skillRating,
                queuedAt: status.queuedAt,
                position: await this.scrimService.getQueuePosition(user.id),
            };
        } catch (error) {
            throw new Error(`Failed to get queue status: ${error.message}`);
        }
    }

    @Query(() => QueueStats)
    async getQueueStats(
        @Args('gameId', { type: () => String, nullable: true }) gameId?: string,
    ): Promise<QueueStats> {
        try {
            const stats = await this.queueService.getQueueStats(gameId);
            return {
                totalQueued: stats.totalQueued,
                averageWaitTime: stats.averageWaitTime,
                gameStats: stats.gameStats.map(gs => ({
                    gameId: gs.gameId,
                    queuedCount: gs.queuedCount,
                })),
            };
        } catch (error) {
            throw new Error(`Failed to get queue stats: ${error.message}`);
        }
    }

    @Mutation(() => [MatchmakingResult])
    @UseGuards(AuthorizeGuard())
    async processMatchmaking(): Promise<MatchmakingResult[]> {
        try {
            const results = await this.queueService.processMatchmaking();
            return results.map(result => ({
                scrimId: result.scrimId,
                playerIds: result.players,
                gameId: result.gameId,
                skillRating: result.skillRating,
            }));
        } catch (error) {
            throw new Error(`Failed to process matchmaking: ${error.message}`);
        }
    }
}

// GraphQL Object Types
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
class QueueStatus {
    @Field(() => ID)
    playerId: string;

    @Field(() => ID)
    gameId: string;

    @Field(() => Int)
    skillRating: number;

    @Field()
    queuedAt: Date;

    @Field(() => Int)
    position: number;
}

@ObjectType()
class QueueStats {
    @Field(() => Int)
    totalQueued: number;

    @Field(() => Int)
    averageWaitTime: number;

    @Field(() => [GameQueueStats])
    gameStats: GameQueueStats[];
}

@ObjectType()
class GameQueueStats {
    @Field(() => ID)
    gameId: string;

    @Field(() => Int)
    queuedCount: number;
}

@ObjectType()
class MatchmakingResult {
    @Field(() => ID)
    scrimId: string;

    @Field(() => [ID])
    playerIds: string[];

    @Field(() => ID)
    gameId: string;

    @Field(() => Int)
    skillRating: number;
}