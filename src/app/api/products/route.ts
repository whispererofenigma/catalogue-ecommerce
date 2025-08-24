// src/app/api/products/route.ts
import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Handles the creation of a new product and its associated secondary images.
 */
export async function POST(request: Request) {
  const supabase = await createAdminClient();

  try {
    // 1. Destructure the new, more complex payload from the form
    const { productData, imageActions } = await request.json();
    const { newSecondaryImageKeys } = imageActions || {};

    // 2. Insert the main product data first to get its generated UUID
    const { data: newProduct, error: productInsertError } = await supabase
      .from('products')
      .insert(productData) // The trigger will create the slug
      .select()
      .single();

    if (productInsertError) {
      console.error('Error inserting new product:', productInsertError.message);
      if (productInsertError.code === '23505') { // unique_violation on name/slug
        return NextResponse.json({ error: 'A product with this name already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: productInsertError.message }, { status: 500 });
    }

    // 3. If there are secondary images, insert them now
    if (newSecondaryImageKeys && newSecondaryImageKeys.length > 0) {
      const productId = newProduct.uuid;

      const imagesToInsert = newSecondaryImageKeys.map((key: string) => ({
        product_id: productId,
        image_key: key,
      }));

      const { error: imagesInsertError } = await supabase
        .from('product_secondary_images')
        .insert(imagesToInsert);

      if (imagesInsertError) {
        console.error('Error inserting secondary images:', imagesInsertError.message);
        // Important: The main product was still created. We return a specific error.
        // In a real-world scenario, you might want to "roll back" the product creation,
        // but for now, this provides clear feedback.
        return NextResponse.json(
            {
                error: `Product was created, but failed to add secondary images: ${imagesInsertError.message}`,
                product: newProduct
            },
            { status: 207 } // 207 Multi-Status is appropriate here
        );
      }
    }

    // 4. Revalidate paths to update the cache
    revalidatePath('/products'); // Rebuilds the main product list
    revalidatePath('/admin'); // Rebuilds the admin dashboard list
    if (newProduct.slug) {
      revalidatePath(`/products/${newProduct.slug}`); // Revalidate the new product's detail page
    }

    return NextResponse.json(newProduct);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error('An unexpected error occurred in POST /api/products:', e.message);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}