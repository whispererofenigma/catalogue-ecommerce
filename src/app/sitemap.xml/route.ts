// app/sitemap.xml/route.ts
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: products, error } = await supabase.from('products').select('slug, last_updated');
  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${process.env.NEXT_PUBLIC_SITE_URL}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>
      <url>
        <loc>${process.env.NEXT_PUBLIC_SITE_URL}/products</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>
      <url>
        <loc>${process.env.NEXT_PUBLIC_SITE_URL}/categories</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>
      ${products?.map(({ slug, last_updated }) => `
        <url>
          <loc>${process.env.NEXT_PUBLIC_SITE_URL}/products/${slug}</loc>
          <lastmod>${last_updated}</lastmod>
        </url>
      `).join('')}
    </urlset>
  `;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}