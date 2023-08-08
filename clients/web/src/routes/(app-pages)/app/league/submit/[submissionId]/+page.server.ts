import { error } from '@sveltejs/kit';
import { MatchStore, SubmissionStore } from '$houdini';
import type { LoadEvent } from '@sveltejs/kit';

export async function load(event: LoadEvent) {
    console.log("Loading that submission data, sir.");
    const params = event.params;
    if (!params || !params.submissionId) throw error(404);
    
    const variables = {
        submissionId: params.submissionId,
    };
    
    const ss = new SubmissionStore();
    const ms = new MatchStore();
    
    const msData = (await ms.fetch({ event, variables })).data;
    try {
        const ssData = (await ss.fetch({ event, variables })).data;

        return {
            submissionId: params.submissionId,
            ssData: ssData,
            msData: msData,
        };
    } catch (e) {
        console.log(e);

        console.log("Errored out getting submission data.");
        
        return {
            submissionId: params.submissionId,
            msData: msData,
        };
    }
}