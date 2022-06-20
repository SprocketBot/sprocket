// TODO: Create an actual api endpoint for this
export async function getTemplate(name: string = "Star of the week"): Promise<any> {
    return await fetch(`/api/template/${encodeURI(name)}`).then(r => r.json())
}