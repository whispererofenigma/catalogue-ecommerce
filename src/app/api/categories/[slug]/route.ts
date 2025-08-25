// app/api/categories/[slug]/route.ts
import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { deleteR2Object } from '@/lib/r2'; // We'll reuse our R2 helper
import { revalidatePath } from 'next/cache';

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createAdminClient();
    const categoryData = await request.json();
    const { oldThumbnailKey, ...updateData } = categoryData;

    const { data, error } = await supabase
        .from('categories')
        .update(updateData) // name, description, thumbnail_key
        .eq('slug', slug)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If update was successful AND there was an old thumbnail, delete it from R2
    if (oldThumbnailKey) {
        await deleteR2Object(oldThumbnailKey);
    }

    revalidatePath(`/categories/${slug}`); // Rebuilds the main product list
    revalidatePath('/admin'); // Rebuilds the admin dashboard list

    return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createAdminClient();

    // First, find the category to get its thumbnail_key
    const { data: category, error: findError } = await supabase
        .from('categories')
        .select('thumbnail_key')
        .eq('slug', slug)
        .single();

    if (findError || !category) {
        return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    // Now, delete the category from the database
    const { error: deleteError } = await supabase.from('categories').delete().eq('slug', slug);

    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // If DB deletion was successful and a thumbnail exists, delete from R2
    if (category.thumbnail_key) {
        await deleteR2Object(category.thumbnail_key);
    }

    revalidatePath('/categories'); // Rebuilds the main product list
    revalidatePath('/admin'); // Rebuilds the admin dashboard list

    return NextResponse.json({ message: 'Category deleted successfully.' });
}