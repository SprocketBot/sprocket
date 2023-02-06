import type {RequestHandler} from "@sveltejs/kit";
import {ReportTemplateDAO} from "$utils/server/database/ReportTemplate.dao";

export const GET: RequestHandler = async ({params}) => {
    try {
        const values = await ReportTemplateDAO.getFilterValues(params.id);
        return {
            status: 200,
            body: JSON.stringify(values),
        };
    } catch (err) {
        return {
            status: 500,
            body: err,
        };
    }
};
