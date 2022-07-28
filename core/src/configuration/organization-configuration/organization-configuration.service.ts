import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindConditions, FindOneOptions} from "typeorm";
import {Like, Repository} from "typeorm";

import {
    Organization,
    OrganizationConfigurationAllowedValue,
    OrganizationConfigurationKey,
    OrganizationConfigurationValue,
} from "../../database";
import type {OrganizationConfigurationKeyCode, OrganizationConfigurationKeyTypes} from "../../database/configuration/organization_configuration_key";
import {OrganizationConfigurationKeyType} from "../../database/configuration/organization_configuration_key";
import type {OrganizationConfiguration} from "./organization-configuration.types";

@Injectable()
export class OrganizationConfigurationService {
    constructor(
        @InjectRepository(Organization) private organizationRepository: Repository<Organization>,
        @InjectRepository(OrganizationConfigurationKey) private keyRepository: Repository<OrganizationConfigurationKey>,
        @InjectRepository(OrganizationConfigurationAllowedValue) private allowedValueRepository: Repository<OrganizationConfigurationAllowedValue>,
        @InjectRepository(OrganizationConfigurationValue) private valueRepository: Repository<OrganizationConfigurationValue>,
    ) {}

    async getOrganizationConfigurations(organizationId: number, code?: OrganizationConfigurationKeyCode): Promise<OrganizationConfiguration[]> {
        const where: FindConditions<OrganizationConfigurationValue> = {
            organization: {
                id: organizationId,
            },
        };

        if (code) where.key = {code};
        
        const values = await this.valueRepository.find({
            where: where,
            relations: ["organization", "organization.profile", "key", "key.allowedValues"],
        });

        return values.map(v => ({
            organization: v.organization,
            key: v.key.code,
            value: v.value,
            allowedValues: v.key.allowedValues,
        }));
    }

    async getOrganizationConfigurationKeys(): Promise<OrganizationConfigurationKey[]> {
        return this.keyRepository.find();
    }

    async getOrganizationConfigurationAllowedValues(code: string): Promise<OrganizationConfigurationAllowedValue[]> {
        return this.allowedValueRepository.find({
            relations: ["key"],
            where: {
                key: {code},
            },
        });
    }

    async getOrganizationConfigurationValue<T extends OrganizationConfigurationKeyTypes[keyof OrganizationConfigurationKeyTypes]>(organizationId: number, code: OrganizationConfigurationKeyCode): Promise<T> {
        const organizationConfigurationValue = await this.valueRepository.findOne({
            relations: ["key"],
            where: {
                organization: organizationId,
                key: {code},
            },
        });

        let organizationConfigurationKey: OrganizationConfigurationKey;

        if (!organizationConfigurationValue) {
            organizationConfigurationKey = await this.keyRepository.findOneOrFail({
                where: {code},
            });
        }

        return this.parseValue(
            organizationConfigurationValue?.key ?? organizationConfigurationKey!,
            organizationConfigurationValue?.value ?? organizationConfigurationKey!.default,
        ) as T;
    }

    async findOrganizationConfigurationValue(value: string, options?: FindOneOptions<OrganizationConfigurationValue>): Promise<OrganizationConfigurationValue> {
        return this.valueRepository.findOneOrFail(Object.assign(options ?? {}, {
            where: {
                value: Like(`%${value}%`),
            },
        }));
    }

    async createOrganizationConfigurationValue(organizationId: number, code: string, value: string): Promise<OrganizationConfigurationValue> {
        const organization = await this.organizationRepository.findOneOrFail(organizationId);
        const key = await this.keyRepository.findOneOrFail({where: {code} });
        const allowedValues = await this.allowedValueRepository.find({
            relations: ["key"],
            where: {key: {code} },
        });

        if (!this.validateValue(value, allowedValues)) {
            throw new Error(`Value ${value} does not conform to the allowed values`);
        }

        const ocValue = this.valueRepository.create({
            value, organization, key,
        });
        await this.valueRepository.save(ocValue);

        return ocValue;
    }

    async updateOrganizationConfigurationValue(organizationId: number, code: string, newValue: string): Promise<OrganizationConfigurationValue> {
        const allowedValues = await this.allowedValueRepository.find({
            relations: ["key"],
            where: {key: {code} },
        });

        if (!this.validateValue(newValue, allowedValues)) {
            throw new Error(`Value ${newValue} does not conform to the allowed values`);
        }

        const ocValue = await this.valueRepository.findOneOrFail({
            relations: ["key"],
            where: {
                organization: organizationId,
                key: {code},
            },
        });

        ocValue.value = newValue;
        await this.valueRepository.save(ocValue);

        return ocValue;
    }

    /**
     * Checks that a given value matches at least one of the given allowedValues.
     * @param value The value to check.
     * @param allowedValues The allowed values to check the given value against.
     * @returns True if the given value matches at least one of the given allowedValues, false otherwise.
     */
    validateValue(value: string, allowedValues: OrganizationConfigurationAllowedValue[]): boolean {
        if (!allowedValues.length) return true;
        
        for (const allowedValue of allowedValues) {
            if (allowedValue.pattern) {
                const regex = new RegExp(allowedValue.value);
                if (value.match(regex)) return true;
            } else if (value === allowedValue.value) return true;
        }
        return false;
    }

    parseValue(key: OrganizationConfigurationKey, value: string): OrganizationConfigurationKeyTypes[keyof OrganizationConfigurationKeyTypes] {
        switch (key.type) {
            case OrganizationConfigurationKeyType.ARRAY_STRING:
                return JSON.parse(value) as string[];
            case OrganizationConfigurationKeyType.FLOAT:
                return parseFloat(value);
            case OrganizationConfigurationKeyType.INTEGER:
                return parseInt(value);
            case OrganizationConfigurationKeyType.STRING:
                return value;
            default:
                throw new Error("Invalid key type given");
        }
    }
}
