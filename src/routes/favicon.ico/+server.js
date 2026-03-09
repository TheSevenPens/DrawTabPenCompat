export const prerender = true;

export function GET() {
    // Prevent noisy 404s from browsers requesting /favicon.ico by default.
    return new Response(null, { status: 204 });
}
