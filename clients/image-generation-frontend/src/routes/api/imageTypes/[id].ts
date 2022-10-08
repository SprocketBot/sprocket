import type {EndpointOutput,Request} from "@sveltejs/kit";

import {ReportTemplateDAO} from "$utils/server/database/ReportTemplate.dao";

export const GET = async ({params}: Request): Promise<EndpointOutput> => {
    const imageType = await ReportTemplateDAO.getByCode(params.id);
    return {
        status: 200,
        body: JSON.stringify(imageType),
    };
};
