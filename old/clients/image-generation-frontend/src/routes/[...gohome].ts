export async function GET() {
    return {
        headers: {Location: "/"},
        status: 302,
    };
}
