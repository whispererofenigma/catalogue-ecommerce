// app/api/categories/route.ts
import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createAdminClient();
  const categoryData = await request.json(); // name, description, thumbnail_key

  // The database trigger will handle the slug automatically.
  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // unique_violation on name or slug
        return NextResponse.json({ error: 'A category with this name already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}