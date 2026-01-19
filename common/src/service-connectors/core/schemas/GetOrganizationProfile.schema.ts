import { z } from 'zod';

import { OrganizationProfileSchema } from '../types';

export const GetOrganizationProfile_Request = z.object({ id: z.number() });

export const GetOrganizationProfile_Response = OrganizationProfileSchema;
