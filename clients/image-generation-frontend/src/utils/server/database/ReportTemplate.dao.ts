import {knexClient} from "../knex";
import type {ReportTemplate} from "./ReportTemplate.model";

export type ReportTemplateGetAll = Array<Omit<ReportTemplate, "templateStructure">>;

export type FilterValue = {
    name: string
    description: string
    code: string
    data: unknown
}

/**
 * Create Script:
 * | create table report_template
 * | (
 * |    templateStructure jsonb not null,
 * |    reportCode varchar(64)
 * |        constraint report_template_pk
 * |        primary key,
 * |    displayName text not null,
 * |    description text not null
 * | );
 * | create unique index report_templateStructure_uindex
 * | on report_template (templateStructure);
 */
class ReportTemplateDAO {
    recursed = false;

    async getAll(): Promise<ReportTemplateGetAll> {
        
        const results = await knexClient.select("reportCode", "displayName", "description").from("sprocket.image_template");

        return results as ReportTemplateGetAll;
    }

    async getByCode(reportCode: string): Promise<ReportTemplate> {
        const result = await knexClient.select("*").from("sprocket.image_template")
            .where({ reportCode: reportCode });
        if (result.length) {
            return result[0] as ReportTemplate;
        }
        throw new Error(`No report with code ${reportCode} could be found.`);
    }

    async runReport(reportCode: string, reportFilters: Record<string, string>): Promise<unknown> {
        const template = await this.getByCode(reportCode);

        const arr = []
        for (const k in reportFilters) {
            arr.push(reportFilters[k])
        }
        console.log(arr)
        
        const { query } = template.query
        const regex = /[$][0-9]/g;
        const results = await knexClient.raw(query.replace(regex, '?'), arr);
        if (!results.rows.length) throw new Error("No data returned from query!");
        const result = results.rows[0];
        if (!result?.data) throw new Error("Missing required property 'data' from report results");
        return result.data;
    }

    async getFilterValues(reportCode: string): Promise<FilterValue[]> {
        const template = await this.getByCode(reportCode);
        const filters = template.query.filters;
        //console.log(filters);
        const filterValues = await Promise.all(filters.map(async filter => {
            const results = await knexClient.raw(filter.query);
            //console.log(results);
            return {
                name: filter.name,
                description: filter.description,
                code: filter.code,
                data: results.rows,
            };
        }));
        return filterValues;
        
    }
}
const reportTemplateDao = new ReportTemplateDAO();
export {reportTemplateDao as ReportTemplateDAO};
