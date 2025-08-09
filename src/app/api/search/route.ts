// app/api/search/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const highlightSlug = searchParams.get('highlight'); // Now the API is aware of the highlight

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const words = query.trim().split(' ').filter(word => word.length > 0);
    const formattedQuery = words.map((word, i) => {
      return i === words.length - 1 ? word + ':*' : word;
    }).join(' & ');

    const { data: productList, error } = await supabase
      .from('products')
      .select('name, slug, image_key, price, description') // Select all needed fields
      .filter('searchable_text_vector', 'fts(english)', formattedQuery)
      .limit(20);

    if (error) { throw error; }

    // --- NEW LOGIC TO HANDLE HIGHLIGHTING ---
    let highlightedProduct = null;
    let otherProducts = productList || [];

    if (highlightSlug && productList) {
      highlightedProduct = productList.find(p => p.slug === highlightSlug) || null;
      otherProducts = productList.filter(p => p.slug !== highlightSlug);
    }
    // --- END OF NEW LOGIC ---

    // Return a structured response
    return NextResponse.json({ highlightedProduct, otherProducts });

  } catch (error) { // <-- `error` is of type `unknown`
    // Check if it's a standard Error object
    if (error instanceof Error) {
      console.error('Search API Error:', error.message);
      // We can safely access .message now
      return NextResponse.json({ error: error.message }, { status: 500 });
    } 
    // Handle cases where a non-Error was thrown
    else {
      console.error('An unknown error was thrown in Search API:', error);
      return NextResponse.json({ error: 'An unexpected server error occurred' }, { status: 500 });
    }
  }
}