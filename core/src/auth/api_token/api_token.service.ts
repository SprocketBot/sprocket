import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { ApiTokenEntity } from '../../db/api_token/api_token.entity';
import { ApiTokenUsageLogEntity } from '../../db/api_token/api_token_usage_log.entity';
import { UserEntity } from '../../db/user/user.entity';

@Injectable()
export class ApiTokenService {
    private readonly logger = new Logger(ApiTokenService.name);

    constructor(
        @InjectRepository(ApiTokenEntity)
        private readonly apiTokenRepo: Repository<ApiTokenEntity>,
        @InjectRepository(ApiTokenUsageLogEntity)
        private readonly apiTokenUsageRepo: Repository<ApiTokenUsageLogEntity>,
    ) {}

    /**
     * Creates a new API token for a user.
     * Returns the plain text token which must be shown to the user immediately.
     */
    async createToken(
        user: UserEntity,
        name: string,
        scopes: string[],
        expiresAt?: Date,
    ): Promise<{ token: string; apiToken: ApiTokenEntity }> {
        const randomPart = randomBytes(24).toString('hex'); // 48 chars of hex
        const prefix = 'sk_prod';
        const token = `${prefix}_${randomPart}`;
        const tokenHash = this.hashToken(token);
        const tokenPrefix = token.substring(0, 8) + '...';

        const apiToken = this.apiTokenRepo.create({
            user,
            name,
            scopes,
            tokenHash,
            tokenPrefix,
            expiresAt,
            createdAt: new Date(),
        });

        await this.apiTokenRepo.save(apiToken);
        
        return { token, apiToken };
    }

    async getTokensForUser(userId: string): Promise<ApiTokenEntity[]> {
        return this.apiTokenRepo.find({
            where: { user: { id: userId } }, // Assuming userId maps to id of UserEntity or relation ID
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Validates a token and returns the associated ApiToken entity if valid.
     * Checks hash, expiration, and revocation status.
     */
    async validateToken(token: string): Promise<ApiTokenEntity | null> {
        const tokenHash = this.hashToken(token);
        
        const apiToken = await this.apiTokenRepo.findOne({
            where: { tokenHash },
            relations: ['user'],
        });

        if (!apiToken) {
            return null;
        }

        if (apiToken.isRevoked) {
            return null;
        }

        if (apiToken.expiresAt && apiToken.expiresAt < new Date()) {
            return null;
        }
        
        return apiToken;
    }

    async revokeToken(tokenId: string, revokedBy?: UserEntity): Promise<void> {
        await this.apiTokenRepo.update(tokenId, {
            isRevoked: true,
            revokedAt: new Date(),
            revokedBy,
        });
    }

    async recordUsage(
        token: ApiTokenEntity,
        usage: {
            endpoint: string;
            method: string;
            statusCode: number;
            ipAddress: string;
            userAgent?: string;
            wasBlocked: boolean;
        },
    ): Promise<void> {
        try {
            // Update last used on token
            // We use query builder or direct update to avoid overwriting other fields concurrently if possible
            // But simple save is probably fine for now.
            // Using update to be lighter.
            await this.apiTokenRepo.update(token.id, {
                lastUsedAt: new Date(),
                usageCount: () => '"usageCount" + 1',
            });

            const log = this.apiTokenUsageRepo.create({
                token,
                ...usage,
            });

            await this.apiTokenUsageRepo.save(log);
        } catch (e) {
            this.logger.error(`Failed to record API token usage: ${e}`);
        }
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }
}
