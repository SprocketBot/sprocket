import type {RequestHandler} from "@sveltejs/kit";
import {ReportTemplateDAO} from "$utils/server/database/ReportTemplate.dao";

export const GET: RequestHandler = async ({params}) => {
    const imageType = await ReportTemplateDAO.getByCode(params.id);
    return {
        status: 200,
        body: JSON.stringify(imageType),
    };
};
