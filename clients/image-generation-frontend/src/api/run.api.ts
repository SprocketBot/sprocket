export const runReport = async (
    reportCode: string,
    inputFile: string,
    outputFile: string,
    filterValues: Record<string, string | number>,
): Promise<boolean> => {
    const res = await fetch(`/api/exec/${reportCode}`, {
        method: "POST",
        body: JSON.stringify({
            inputFile,
            outputFile,
            filterValues,
        }),
    });
    return res.status === 200;
};
