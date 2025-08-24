// app/robots.txt/route.ts
export async function GET() {
  const robots = `
User-agent: *
Allow: /

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml
  `;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}