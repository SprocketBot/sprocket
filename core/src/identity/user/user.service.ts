import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindManyOptions, FindOneOptions} from "typeorm";
import {Repository} from "typeorm";

import type {IrrelevantFields} from "../../database";
import {
    User,
    UserAuthenticationAccount,
    UserAuthenticationAccountType,
    UserProfile,
} from "../../database";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
        @InjectRepository(UserAuthenticationAccount) private userAuthAcctRepository: Repository<UserAuthenticationAccount>,
    ) {}

    /**
     * Creates an User with a given profile.
     * @param userProfile The profile to give the newly created user.
     * @returns A promise that resolves to the newly created user.
     */
    async createUser(
        userProfile: Omit<UserProfile, IrrelevantFields | "id" | "user">,
        authenticationAccounts: Array<Omit<UserAuthenticationAccount, IrrelevantFields | "id" | "user">>,
    ): Promise<User> {
        const profile = this.userProfileRepository.create(userProfile);
        const authAccts = authenticationAccounts.map(acct => this.userAuthAcctRepository.create(acct));
        const user = this.userRepository.create({profile});
        user.authenticationAccounts = authAccts;
        authAccts.forEach(aa => { aa.user = user });

        await this.userProfileRepository.save(user.profile);
        await this.userRepository.save(user);
        await this.userAuthAcctRepository.save(authAccts);
        return user;
    }

    /**
     * Adds authentication accounts to a user with a given id
     * @param id The id of the user to modify
     * @param authenticationAccounts An array of authentication accounts to add
     * to the user
     * @returns A promise that resolves to the newly created user.
     */
    async addAuthenticationAccounts(
        id: number,
        authenticationAccounts: Array<Omit<UserAuthenticationAccount, IrrelevantFields | "id" | "user">>,
    ): Promise<User> {
        const authAccts = authenticationAccounts.map(acct => this.userAuthAcctRepository.create(acct));
        const user = await this.userRepository.findOneOrFail(id);
        user.authenticationAccounts = authAccts;
        authAccts.forEach(aa => { aa.user = user });
        await this.userAuthAcctRepository.save(authAccts);
        await this.userRepository.save(user);
        return user;
    }

    /**
     * Finds the authentication accounts associated with a user
     * @param id The id of the user to find
     * to the user
     * @returns A promise that resolves to the array of authentication accounts
     * for the user.
     */
    async getUserAuthenticationAccountsForUser(userId: number): Promise<UserAuthenticationAccount[]> {
        const authAccounts = await this.userAuthAcctRepository.find({where: {user: {id: userId} } });
        return authAccounts;
    }

    async getUserDiscordAccount(userId: number): Promise<UserAuthenticationAccount> {
        return this.userAuthAcctRepository.findOneOrFail({
            where: {
                accountType: UserAuthenticationAccountType.DISCORD,
                user: {id: userId},
            },
        });
    }

    /**
     * Finds a User by its id and fails if not found.
     * @param id The id of the user to find.
     * @retusn The user with the given id, if found.
     */
    async getUserById(id: number): Promise<User> {
        return this.userRepository.findOneOrFail(id, {relations: ["profile"] });
    }

    async getUser(query: FindOneOptions<UserProfile>): Promise<User | undefined> {
        const userProfile = await this.userProfileRepository.findOne({
            ...query,
            relations: ["user", ...query.relations ?? []],
        });
        return userProfile?.user;
    }

    /**
     * Finds Users that match a given query.
     * @param query A query to search for matching Organzations.
     * @returns An array containg Users matching the given query.
     */
    async getUsers(query: FindManyOptions<UserProfile>): Promise<User[]> {
        const userProfiles = await this.userProfileRepository.find({
            ...query,
            relations: ["user", ...query.relations ?? []],
        });
        return userProfiles.map(op => op.user);
    }

    /**
     * Updates the UserProfile of an User with a given id.
     * @param userId The id of the user's profile to update.
     * @param data The fields and values on the UserProfile to update.
     * @returns The updated UserProfile.
     */
    async updateUserProfile(userId: number, data: Omit<Partial<UserProfile>, "user">): Promise<UserProfile> {
        let {profile} = await this.userRepository.findOneOrFail(
            userId,
            {relations: ["profile"] },
        );
        profile = this.userProfileRepository.merge(profile, data);
        await this.userProfileRepository.save(profile);
        return profile;
    }

    /**
     * Deletes an User with a given id from the database.
     * @param id The id of the User to delete.
     * @returns The deleted User.
     */
    async deleteUser(id: number): Promise<User> {
        const toDelete = await this.userRepository.findOneOrFail(id, {
            relations: ["profile"],
        });
        await this.userRepository.delete({id});
        await this.userProfileRepository.delete({id: toDelete.profile.id});
        return toDelete;
    }

    /**
     * Searches for a UserProfile for a given user or fails
     * @param userId The id of the user whose profile to find
     * @returns The found UserProfile
     */
    async getUserProfileForUser(userId: number): Promise<UserProfile> {
        const org = await this.userRepository.findOneOrFail(userId, {relations: ["profile"] });
        return org.profile;
    }
}
