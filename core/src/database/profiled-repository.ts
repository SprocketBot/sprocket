import {Injectable} from "@nestjs/common";
import type {DeepPartial, FindOneOptions} from "typeorm";

import type {BaseModel} from "./base-model";
import type {BaseRepository} from "./base-repository";

@Injectable()
export abstract class ProfiledRepository<T extends BaseModel & {profile: TProfile;}, TProfile extends BaseModel> {
    abstract readonly primaryRepository: BaseRepository<T>;

    abstract readonly profileRepository: BaseRepository<TProfile>;

    abstract readonly profileInverseRelationshipName: keyof TProfile;

    async create(data: DeepPartial<T>): Promise<T> {
        const newPrimary = this.primaryRepository.create(data);
        const newProfile = this.profileRepository.create(data.profile as TProfile);
        newPrimary.profile = newProfile;
        newProfile[this.profileInverseRelationshipName as string] = newPrimary;

        return newPrimary;
    }

    async createAndSave(data: DeepPartial<T>): Promise<T> {
        const newEntity = await this.create(data);

        await this.primaryRepository.save(newEntity);
        await this.profileRepository.save(newEntity.profile);

        return newEntity;
    }

    async delete(id: number): Promise<T> {
        const deletedEntity = await this.primaryRepository.findOneOrFail({
            where: {
                id: id,
            },
            relations: {
                profile: true,
            },
        } as FindOneOptions<T>);

        await this.profileRepository.delete(deletedEntity.profile.id);
        await this.primaryRepository.delete(deletedEntity.id);

        return deletedEntity;
    }
}
