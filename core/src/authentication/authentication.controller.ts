import {Controller, Get, Logger, Query, Request, Response, UseGuards} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {config} from "@sprocketbot/common";
import {Request as Req, Response as Res} from "express";
import {v4} from "uuid";

import {UserRepository} from "../identity/database/user.repository";
import {UserAuthenticationAccountRepository} from "../identity/database/user-authentication-account.repository";
import {UserAuthenticationAccountType} from "../identity/database/user-authentication-account-type.enum";
import {AuthenticationService} from "./authentication.service";
import {DiscordProfileSchema} from "./strategies/discord/discord.types";
import {DiscordAuthGuard} from "./strategies/discord/guards/discord.guard";
import {EpicProfileSchema} from "./strategies/epic/epic.types";
import {EpicAuthGuard} from "./strategies/epic/guards/epic.guard";
import {GoogleProfileSchema} from "./strategies/google/google.types";
import {GoogleAuthGuard} from "./strategies/google/guards/google.guard";
import {JwtAuthPayloadSchema} from "./strategies/jwt/jwt.types";
import {MicrosoftAuthGuard} from "./strategies/microsoft/guards/microsoft.guard";
import {MicrosoftProfileSchema} from "./strategies/microsoft/microsoft.types";
import {SteamAuthGuard} from "./strategies/steam/guards/steam.guard";
import {SteamProfileSchema} from "./strategies/steam/steam.types";
import {XboxAuthGuard} from "./strategies/xbox/guards/xbox.guard";
import {XboxProfileSchema} from "./strategies/xbox/xbox.types";

@Controller("authentication")
export class AuthenticationController {
    private readonly logger = new Logger(AuthenticationController.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly userRepository: UserRepository,
        private readonly userAuthenticationAccountRepository: UserAuthenticationAccountRepository,
        private readonly authenticationService: AuthenticationService,
    ) {}

    @Get("google/login")
    @UseGuards(GoogleAuthGuard)
    async googleLogin(@Request() req: Req, @Response() res: Res, @Query("state") state?: string): Promise<void> {
        const googleProfile = GoogleProfileSchema.safeParse(req.user);
        if (!googleProfile.success) {
            const uuid = v4();
            this.logger.error(`Failed to parse provider profile (${uuid})`);
            res.redirect(
                `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
            );
            return;
        }

        if (state) {
            try {
                const payload = this.jwtService.verify(state);
                const data = JwtAuthPayloadSchema.safeParse(payload);
                if (!data.success) {
                    const uuid = v4();
                    this.logger.error(`Failed to jwt payload (${uuid})`);
                    res.redirect(
                        `${
                            config.auth.frontend_callback
                        }?status=error&message=${"Could not resolve authenticated account."}`,
                    );
                    return;
                }

                const user = await this.userRepository.findById(data.data.userId);
                const acc = await this.userAuthenticationAccountRepository.getAuthAccount(
                    UserAuthenticationAccountType.GOOGLE,
                    googleProfile.data.id,
                );

                if (!acc)
                    await this.userAuthenticationAccountRepository.createAndSave({
                        accountType: UserAuthenticationAccountType.GOOGLE,
                        accountId: googleProfile.data.id,
                        userId: user.id,
                    });
            } catch (e) {
                res.redirect(
                    `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
                );
                this.logger.error(e);
                return;
            }
        } else {
            try {
                const user = await this.userAuthenticationAccountRepository
                    .getUserByAuthAccount(UserAuthenticationAccountType.GOOGLE, googleProfile.data.id)
                    .catch(() => {
                        throw new Error("User not found");
                    });
                const tokens = await this.authenticationService.login(user.id);

                res.redirect(
                    `${config.auth.frontend_callback}?token=${tokens.access},${tokens.refresh}&status=success`,
                );
                return;
            } catch (e) {
                res.redirect(
                    `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
                );
                this.logger.error(e);
                return;
            }
        }

        res.send(`Hello, ${googleProfile.data.displayName}! Thanks for signing in with Google!`);
        return;
    }

    @Get("epic/login")
    @UseGuards(EpicAuthGuard)
    async epicLogin(@Request() req: Req, @Response() res: Res, @Query("state") state?: string): Promise<void> {
        const epicProfile = EpicProfileSchema.safeParse(req.user);
        if (!epicProfile.success) {
            const uuid = v4();
            this.logger.error(`Failed to parse provider profile (${uuid})`);
            res.redirect(
                `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
            );
            return;
        }

        if (state) {
            try {
                const payload = this.jwtService.verify(state);
                const data = JwtAuthPayloadSchema.safeParse(payload);
                if (!data.success) {
                    const uuid = v4();
                    this.logger.error(`Failed to jwt payload (${uuid})`);
                    res.redirect(
                        `${
                            config.auth.frontend_callback
                        }?status=error&message=${"Could not resolve authenticated account."}`,
                    );
                    return;
                }

                const user = await this.userRepository.findById(data.data.userId);
                const acc = await this.userAuthenticationAccountRepository.getAuthAccount(
                    UserAuthenticationAccountType.EPIC,
                    epicProfile.data.sub,
                );

                if (!acc)
                    await this.userAuthenticationAccountRepository.createAndSave({
                        accountType: UserAuthenticationAccountType.EPIC,
                        accountId: epicProfile.data.sub,
                        userId: user.id,
                    });
            } catch (e) {
                res.redirect(
                    `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
                );
                this.logger.error(e);
                return;
            }
        } else {
            try {
                const user = await this.userAuthenticationAccountRepository
                    .getUserByAuthAccount(UserAuthenticationAccountType.EPIC, epicProfile.data.sub)
                    .catch(() => {
                        throw new Error("User not found");
                    });
                const tokens = await this.authenticationService.login(user.id);

                res.redirect(
                    `${config.auth.frontend_callback}?token=${tokens.access},${tokens.refresh}&status=success`,
                );
                return;
            } catch (e) {
                res.redirect(
                    `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
                );
                this.logger.error(e);
                return;
            }
        }

        res.send(`Hello, ${epicProfile.data.preferred_username}! Thanks for signing in with Epic Games!`);
        return;
    }

    @Get("discord/login")
    @UseGuards(DiscordAuthGuard)
    async discordLogin(@Request() req: Req, @Response() res: Res, @Query("state") state?: string): Promise<void> {
        const discordProfile = DiscordProfileSchema.safeParse(req.user);
        if (!discordProfile.success) {
            const uuid = v4();
            this.logger.error(`Failed to parse provider profile (${uuid})`);
            res.redirect(
                `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
            );
            return;
        }

        if (state) {
            try {
                const payload = this.jwtService.verify(state);
                const data = JwtAuthPayloadSchema.safeParse(payload);
                if (!data.success) {
                    const uuid = v4();
                    this.logger.error(`Failed to jwt payload (${uuid})`);
                    res.redirect(
                        `${
                            config.auth.frontend_callback
                        }?status=error&message=${"Could not resolve authenticated account."}`,
                    );
                    return;
                }

                const user = await this.userRepository.findById(data.data.userId);
                const acc = await this.userAuthenticationAccountRepository.getAuthAccount(
                    UserAuthenticationAccountType.DISCORD,
                    discordProfile.data.id,
                );

                if (!acc)
                    await this.userAuthenticationAccountRepository.createAndSave({
                        accountType: UserAuthenticationAccountType.DISCORD,
                        accountId: discordProfile.data.id,
                        userId: user.id,
                    });
            } catch (e) {
                res.redirect(
                    `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
                );
                this.logger.error(e);
                return;
            }
        } else {
            try {
                const user = await this.userAuthenticationAccountRepository
                    .getUserByAuthAccount(UserAuthenticationAccountType.DISCORD, discordProfile.data.id)
                    .catch(() => {
                        throw new Error("User not found");
                    });
                const tokens = await this.authenticationService.login(user.id);

                res.redirect(
                    `${config.auth.frontend_callback}?token=${tokens.access},${tokens.refresh}&status=success`,
                );
                return;
            } catch (e) {
                this.logger.error(e);
                res.redirect(
                    `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
                );
                return;
            }
        }

        res.send(`Hello, ${discordProfile.data.username}! Thanks for signing in with Discord!`);
        return;
    }

    @Get("steam/login")
    @UseGuards(SteamAuthGuard)
    // TODO: Steam does not support states, so we need to figure out a way to link accounts
    async steamLogin(@Request() req: Req, @Response() res: Res): Promise<void> {
        const steamProfile = SteamProfileSchema.safeParse(req.user);
        if (!steamProfile.success) {
            const uuid = v4();
            this.logger.error(`Failed to parse provider profile (${uuid})`);
            res.redirect(
                `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
            );
            return;
        }

        try {
            const user = await this.userAuthenticationAccountRepository
                .getUserByAuthAccount(UserAuthenticationAccountType.STEAM, steamProfile.data.id)
                .catch(() => {
                    throw new Error("User not found");
                });
            const tokens = await this.authenticationService.login(user.id);

            res.redirect(`${config.auth.frontend_callback}?token=${tokens.access},${tokens.refresh}&status=success`);
            return;
        } catch (e) {
            res.redirect(
                `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
            );
            this.logger.error(e);
            return;
        }
    }

    @Get("microsoft/login")
    @UseGuards(MicrosoftAuthGuard)
    async microsoftLogin(@Request() req: Req, @Response() res: Res, @Query("state") state?: string): Promise<void> {
        const microsoftProfile = MicrosoftProfileSchema.safeParse(req.user);
        if (!microsoftProfile.success) {
            const uuid = v4();
            this.logger.error(`Failed to parse provider profile (${uuid})`);
            res.redirect(
                `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
            );
            return;
        }

        if (state) {
            try {
                const payload = this.jwtService.verify(state);
                const data = JwtAuthPayloadSchema.safeParse(payload);
                if (!data.success) {
                    const uuid = v4();
                    this.logger.error(`Failed to jwt payload (${uuid})`);
                    res.redirect(
                        `${
                            config.auth.frontend_callback
                        }?status=error&message=${"Could not resolve authenticated account."}`,
                    );
                    return;
                }

                const user = await this.userRepository.findById(data.data.userId);
                const acc = await this.userAuthenticationAccountRepository.getAuthAccount(
                    UserAuthenticationAccountType.MICROSOFT,
                    microsoftProfile.data.id,
                );

                if (!acc)
                    await this.userAuthenticationAccountRepository.createAndSave({
                        accountType: UserAuthenticationAccountType.MICROSOFT,
                        accountId: microsoftProfile.data.id,
                        userId: user.id,
                    });
            } catch (e) {
                res.redirect(
                    `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
                );
                this.logger.error(e);
                return;
            }
        } else {
            try {
                const user = await this.userAuthenticationAccountRepository
                    .getUserByAuthAccount(UserAuthenticationAccountType.MICROSOFT, microsoftProfile.data.id)
                    .catch(() => {
                        throw new Error("User not found");
                    });
                const tokens = await this.authenticationService.login(user.id);

                res.redirect(
                    `${config.auth.frontend_callback}?token=${tokens.access},${tokens.refresh}&status=success`,
                );
                return;
            } catch (e) {
                res.redirect(
                    `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
                );
                this.logger.error(e);
                return;
            }
        }

        res.send(`Hello, ${microsoftProfile.data.displayName}! Thanks for signing in with Microsoft!`);
        return;
    }

    @Get("xbox/login")
    @UseGuards(XboxAuthGuard)
    async xboxLogin(@Request() req: Req, @Response() res: Res, @Query("state") state?: string): Promise<void> {
        const xboxProfile = XboxProfileSchema.safeParse(req.user);
        if (!xboxProfile.success) {
            const uuid = v4();
            this.logger.error(`Failed to parse provider profile (${uuid})`);
            res.redirect(
                `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
            );
            return;
        }

        if (state) {
            try {
                const payload = this.jwtService.verify(state);
                const data = JwtAuthPayloadSchema.safeParse(payload);
                if (!data.success) {
                    const uuid = v4();
                    this.logger.error(`Failed to jwt payload (${uuid})`);
                    res.redirect(
                        `${
                            config.auth.frontend_callback
                        }?status=error&message=${"Could not resolve authenticated account."}`,
                    );
                    return;
                }

                const user = await this.userRepository.findById(data.data.userId);
                const acc = await this.userAuthenticationAccountRepository.getAuthAccount(
                    UserAuthenticationAccountType.XBOX,
                    xboxProfile.data.id,
                );

                if (!acc)
                    await this.userAuthenticationAccountRepository.createAndSave({
                        accountType: UserAuthenticationAccountType.XBOX,
                        accountId: xboxProfile.data.id,
                        userId: user.id,
                    });
            } catch (e) {
                res.redirect(
                    `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
                );
                this.logger.error(e);
                return;
            }
        } else {
            try {
                const user = await this.userAuthenticationAccountRepository
                    .getUserByAuthAccount(UserAuthenticationAccountType.XBOX, xboxProfile.data.id)
                    .catch(() => {
                        throw new Error("User not found");
                    });
                const tokens = await this.authenticationService.login(user.id);

                res.redirect(
                    `${config.auth.frontend_callback}?token=${tokens.access},${tokens.refresh}&status=success`,
                );
                return;
            } catch (e) {
                res.redirect(
                    `${config.auth.frontend_callback}?status=error&message=${"An unknown exception has occurred."}`,
                );
                this.logger.error(e);
                return;
            }
        }

        res.send(`Hello, ${xboxProfile.data.displayName}! Thanks for signing in with Xbox!`);
        return;
    }
}
