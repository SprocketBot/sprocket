export interface ReportQueryData {
  /**
   * SQL String used to collect data for the report, must contain a field titled "data" (case-sensitive), only the first row will be returned
   * Filters will be replaced inline when the query is complete
   * @example
   * "
   * SELECT SOME_COLUMN AS DATA
   * FROM SOME_TABLE
   * WHERE SOME_COLUMN = :some_filter_code
   * "
   */
  query: string;

  filters: Array<{
    name: string;
    description: string;
    code: string;
    query: string;
  }>;
}

export interface ReportTemplate {
  templateStructure: unknown;

  reportCode: string;

  displayName: string;

  description: string;

  query: ReportQueryData;
}
