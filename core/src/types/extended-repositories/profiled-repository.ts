import type {DeepPartial, FindOneOptions} from "typeorm";

import type {BaseEntity} from "../base-entity";
import type {ExtendedRepository} from "./extended-repository";

export abstract class ProfiledRepository<T extends BaseEntity & {profile: TProfile}, TProfile extends BaseEntity> {
    abstract readonly primaryRepository: ExtendedRepository<T>;

    abstract readonly profileRepository: ExtendedRepository<TProfile>;

    abstract readonly profileInverseRelationshipName: keyof TProfile;

    async create(data: DeepPartial<T>): Promise<T> {
        const newPrimary = this.primaryRepository.create(data);
        const newProfile = this.profileRepository.create(data.profile as TProfile);
        newPrimary.profile = newProfile;
        newProfile[this.profileInverseRelationshipName as string] = newPrimary;

        return newPrimary;
    }

    async update(id: number, data: DeepPartial<T>): Promise<T> {
        let primary = await this.primaryRepository.findOneOrFail({
            where: {id},
            relations: {profile: true},
        } as FindOneOptions<T>);

        primary = this.primaryRepository.merge(primary, data);
        if (data.profile) data.profile = this.profileRepository.merge(primary.profile, data.profile);

        return primary;
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

    async createAndSave(data: DeepPartial<T>): Promise<T> {
        const newEntity = await this.create(data);

        await this.primaryRepository.save(newEntity);
        await this.profileRepository.save(newEntity.profile);

        return newEntity;
    }

    async updateAndSave(id: number, data: DeepPartial<T>): Promise<T> {
        const entity = await this.update(id, data);
        await this.primaryRepository.save(entity);
        await this.profileRepository.save(entity.profile);

        return entity;
    }
}
