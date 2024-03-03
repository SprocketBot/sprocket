// import type {EndpointOutput, Request} from "@sveltejs/kit";
import {ReportTemplateDAO} from "$utils/server/database/ReportTemplate.dao";
import {rmqRequest} from "$utils/rabbitmq";

export async function POST({request, params}) {
    const data = await request.json()
    // const data = JSON.parse(body.toString());
    const results = await ReportTemplateDAO.runReport(params.id, data.filterValues);

    try {
        const res: any = await rmqRequest(
            "media-gen.img.create",
            {
                inputFile: data.inputFile,
                outputFile: data.outputFile,
                template: results,
            },
        );
        if (res?.err) {
            throw new Error(res.err);
        }
        return {
            status: 200,
        };
    } catch (err) {
        return {
            status: 500,
            body: err,
        };
    }
}
