import {browser} from "$app/env";
import {FileManager} from "$src/utils/FileManager";

import {handleApiResponse} from "./common.api";

export async function getOutputs(
    imageTypeId: string,
    filename: string,
): Promise<string[]> {
    if (!browser) return [];
    return handleApiResponse<string[]>(
        await fetch(`api/outputs/${imageTypeId}/${filename}`),
    );
}

export async function downloadOutputImage(
    reportType: string,
    projectName: string,
    filename: string,
): Promise<Blob> {
    if (!browser) return new Blob();
    const res = await handleApiResponse<{getURL: string; size: number}>(
        await fetch(`/api/outputs/${reportType}/${projectName}/${filename}`),
    );
    return FileManager.downloadFile(res.getURL, res.size);
}
