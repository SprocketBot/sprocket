import type {RequestHandler} from "@sveltejs/kit";
import {ReportTemplateDAO} from "$utils/server/database/ReportTemplate.dao";

export const GET: RequestHandler = async () => {
    const types = await ReportTemplateDAO.getAll();
    return {
        status: 200,
        body: JSON.stringify(types),
    };
}
