import type { FilterValues } from '$src/types';
import { handleApiResponse } from './common.api';

export const getFilterValues = async (code: string): Promise<FilterValues[]> =>
  handleApiResponse<FilterValues[]>(await fetch(`/api/filters/${code}`));
