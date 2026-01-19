import type { EndpointOutput } from '@sveltejs/kit';
import { ReportTemplateDAO } from '$utils/server/database/ReportTemplate.dao';

export async function GET(): Promise<EndpointOutput> {
  const types = await ReportTemplateDAO.getAll();
  return {
    status: 200,
    body: JSON.stringify(types),
  };
}
