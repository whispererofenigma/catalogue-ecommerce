// app/api/admin/products/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure this route is always dynamic

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const categorySlug = searchParams.get('category');
    const supabase = await createClient();

    // Start building the query for products
    let productsQuery = supabase
      .from('products')
      .select(`uuid, name, price, slug, image_key, categories!inner ( name )`)
      .order('last_updated', { ascending: false });

    // If there's a search query, apply the FTS filter
    if (query) {
      const words = query.trim().split(' ').filter(word => word.length > 0);
      const formattedQuery = words.map((word, i) => i === words.length - 1 ? word + ':*' : word).join(' & ');
      productsQuery = productsQuery.filter('searchable_text_vector', 'fts(english)', formattedQuery);
    }
    
    // If there's a category filter, apply it
    if (categorySlug) {
      productsQuery = productsQuery.eq('categories.slug', categorySlug);
    }

    // We always need the categories for the filter dropdown
    const categoriesPromise = supabase
      .from('categories')
      .select('uuid, name, slug, thumbnail_key')
      .order('name');
    
    const [
      { data: products, error: productsError },
      { data: categories, error: categoriesError }
    ] = await Promise.all([productsQuery, categoriesPromise]);

    if (productsError || categoriesError) {
      throw productsError || categoriesError;
    }

    return NextResponse.json({ products: products || [], categories: categories || [] });

  } catch (error: unknown) {
    console.error("Admin products API error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}