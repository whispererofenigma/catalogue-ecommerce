// app/robots.txt/route.ts
export async function GET() {
  const robots = `
User-agent: *
Disallow: /admin
Disallow: /login
Disallow: /search
Disallow: /cdn

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml
  `;

  return new Response(robots.trim(), {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
