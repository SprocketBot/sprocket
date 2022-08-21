import {rmqRequest} from "$src/utils/rabbitmq";
import {ReportTemplateDAO} from "$src/utils/server/database/ReportTemplate.dao";
import type {EndpointOutput, Request} from "@sveltejs/kit";


export async function GET({url, params}: Request): Promise<EndpointOutput> {

    try {
    // verify filter values are valid
        const filterValues = await ReportTemplateDAO.getFilterValues(params.imageType);

        for (const {
            data, code, name,
        } of filterValues) {
            const possibleValues: string[] = data.map(v => v.value.toString());
            if (!url.searchParams.has(code)) {
                return {
                    status: 400,
                    body: `missing ${code}`,
                };
            }
            if (!possibleValues.includes(url.searchParams.get(code))) {
                return {
                    status: 400,
                    body: `${name} has no option ${url.searchParams.get(code)}`,
                };
            }
        }

        return {
            status: 200,
            body: JSON.stringify(filterValues),
        };
    } catch (err) {
        return {
            status: 500,
            body: err,
        };
    }
}

export async function post({body, params}: Request): Promise<EndpointOutput> {
    const data = JSON.parse(body.toString());
    const results = await ReportTemplateDAO.runReport(params.id, data.filterValues);

    try {
        const res: any = await rmqRequest(
            "media-gen.img.create",
            {
                inputFile: data.inputFile,
                outputFile: data.outputFile,
                filterValues: results,
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
