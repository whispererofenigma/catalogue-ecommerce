// app/api/search/suggestions/route.ts

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      // For suggestions, return an empty array if there's no query
      return NextResponse.json([]);
    }

    const supabase = await createClient();

    const words = query.trim().split(' ').filter(word => word.length > 0);
    const formattedQuery = words
      .map((word, i) => (i === words.length - 1 ? word + ':*' : word))
      .join(' & ');

    const { data: productList, error } = await supabase
      .from('products')
      .select('name, slug, image_key, price') // Only select fields needed for the dropdown
      .filter('searchable_text_vector', 'fts(english)', formattedQuery)
      .limit(5); // Suggestions list can be shorter

    if (error) throw error;

    return NextResponse.json(productList);
    
  } catch (error: unknown) {
    console.error(
      'Search Suggestions API error:',
      error instanceof Error ? error.message : error
    );
    // On error, return an empty array to prevent the frontend from crashing
    return NextResponse.json([], { status: 500 });
  }
}
