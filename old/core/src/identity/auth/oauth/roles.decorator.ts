import {SetMetadata} from "@nestjs/common";

/* eslint-disable */
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
