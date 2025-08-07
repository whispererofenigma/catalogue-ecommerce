// app/api/products/[slug]/route.ts
import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { deleteR2Object } from '@/lib/r2';

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createAdminClient();
    const productData = await request.json();
    const { oldImageKey, ...updateData } = productData;

    // We no longer generate the slug here. If 'updateData.name' is present,
    // the database trigger will see the change and update the slug automatically.

    const { data, error } = await supabase
      .from('products')
      .update(updateData) // Just send the updated name, price, etc.
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (oldImageKey) {
        await deleteR2Object(oldImageKey);
    }

    return NextResponse.json(data);
}