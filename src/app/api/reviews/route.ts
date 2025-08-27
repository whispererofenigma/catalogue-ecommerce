// app/api/reviews/route.ts
import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const { reviewData, imageKeys, productSlug } = await request.json();
  const supabase = await createAdminClient();

  // 1. Insert the main review data into the 'reviews' table.
  const { data: newReview, error: reviewError } = await supabase
    .from('reviews')
    .insert(reviewData) // { product_id, rating, reviewer_name, title, body }
    .select()
    .single();

  if (reviewError) {
    console.error("Error creating review:", reviewError);
    return NextResponse.json({ error: "Could not create the review." }, { status: 500 });
  }

  // 2. If there are uploaded images, associate them with the new review.
  if (imageKeys && imageKeys.length > 0) {
    const imagesToInsert = imageKeys.map((key: string) => ({
      review_id: newReview.uuid,
      image_key: key,
    }));
    
    const { error: imageError } = await supabase.from('review_images').insert(imagesToInsert);
    if (imageError) {
        console.error("Failed to insert review images:", imageError);
        // In a real app, you might want to delete the review that was just created for consistency.
        return NextResponse.json({ error: "Review was created, but failed to save images." }, { status: 500 });
    }
  }
  
  // 3. Revalidate the product page so the new review appears.
  if (productSlug) {
      revalidatePath(`/products/${productSlug}`);
  }

  return NextResponse.json(newReview);
}