import { z } from 'zod';

import { ScrimSchema } from '../../types';

export const GetScrimByPlayer_Request = z.number().min(0);

export const GetScrimByPlayer_Response = ScrimSchema.nullable();
