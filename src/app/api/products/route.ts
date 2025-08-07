// app/api/products/route.ts
import { createAdminClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createAdminClient();
  const productData = await request.json(); // This has name, description, price, image_key

  // The database trigger will handle the slug automatically.
  // We just insert the data we received from the client.
  const { data, error } = await supabase
    .from('products')
    .insert([productData]) // Simplified insert
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // unique_violation (could happen on slug)
        return NextResponse.json({ error: 'A product with this name already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}