import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { deleteR2Object } from '@/lib/r2';
import { revalidatePath } from 'next/cache';

/**
 * Handles updating a product's details and managing its associated images.
 * This route processes a complex payload to:
 * 1. Update core product data (name, price, etc.).
 * 2. Delete specified secondary images from the database and R2 storage.
 * 3. Add new secondary images to the database.
 * 4. Delete the old main image from R2 storage if it was replaced or removed.
 */
export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    if (!slug) {
        return NextResponse.json({ error: 'Product slug is required.' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    try {
        const { productData, imageActions } = await request.json();
        const { 
            oldMainImageKeyToDelete, 
            newSecondaryImageKeys, 
            deletedSecondaryImageKeys 
        } = imageActions || {};

        // --- Step 1: Update the core product details ---
        // The database trigger will automatically handle slug updates if the name changes.
        const { data: updatedProduct, error: productUpdateError } = await supabase
          .from('products')
          .update(productData)
          .eq('slug', slug)
          .select('uuid') // Select the uuid for the next steps
          .single();

        if (productUpdateError) {
            console.error('Error updating product:', productUpdateError.message);
            return NextResponse.json({ error: `Failed to update product: ${productUpdateError.message}` }, { status: 500 });
        }

        const productId = updatedProduct.uuid;

        // --- Step 2: Handle Secondary Image Deletions (DB & R2) ---
        if (deletedSecondaryImageKeys && deletedSecondaryImageKeys.length > 0) {
            // Delete records from the database first.
            const { error: dbDeleteError } = await supabase
                .from('product_secondary_images')
                .delete()
                .in('image_key', deletedSecondaryImageKeys);
            
            if (dbDeleteError) {
                // Log the error but don't block the process. The R2 objects might still be deletable.
                console.error('Error deleting secondary image records from DB:', dbDeleteError.message);
            }
            
            // Then, delete the actual files from R2 storage.
            // Using Promise.allSettled to ensure all deletions are attempted even if some fail.
            await Promise.allSettled(
                deletedSecondaryImageKeys.map((key: string) => 
                    deleteR2Object(key).catch(e => console.error(`Failed to delete ${key} from R2:`, e))
                )
            );
        }

        // --- Step 3: Handle Secondary Image Additions (DB) ---
        if (newSecondaryImageKeys && newSecondaryImageKeys.length > 0) {
            const imagesToInsert = newSecondaryImageKeys.map((key: string) => ({
                product_id: productId,
                image_key: key,
                // display_order could be set here if needed, defaulting to 0
            }));

            const { error: insertError } = await supabase
                .from('product_secondary_images')
                .insert(imagesToInsert);
            
            if (insertError) {
                console.error('Error inserting new secondary images:', insertError.message);
                // This is a more critical error, as the product is updated but images are missing.
                return NextResponse.json({ error: `Product updated, but failed to add new images: ${insertError.message}` }, { status: 500 });
            }
        }

        // --- Step 4: Handle old Main Image deletion from R2 ---
        if (oldMainImageKeyToDelete) {
            await deleteR2Object(oldMainImageKeyToDelete).catch(e => 
                console.error(`Failed to delete old main image ${oldMainImageKeyToDelete} from R2:`, e)
            );
        }

        // --- Success ---
        return NextResponse.json({ message: 'Product updated successfully', product: updatedProduct });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.error('An unexpected error occurred:', e.message);
        return NextResponse.json({ error: 'An unexpected error occurred while processing the request.' }, { status: 500 });
    }
}

// --- NEW DELETE FUNCTION ---
/**
 * Handles the complete deletion of a product and all its associated images.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    if (!slug) {
        return NextResponse.json({ error: 'Product slug is required.' }, { status: 400 });
    }

    const supabase = await createAdminClient();
    const allImageKeysToDelete: string[] = [];

    try {
        // Step 1: Find the product to get its UUID and main image key.
        const { data: product, error: productFetchError } = await supabase
            .from('products')
            .select('uuid, image_key')
            .eq('slug', slug)
            .single();

        if (productFetchError) {
            // If the product is already gone, it's a success from the user's perspective.
            if (productFetchError.code === 'PGRST116') { 
                return NextResponse.json({ message: 'Product not found, assumed already deleted.' });
            }
            console.error('Error fetching product for deletion:', productFetchError.message);
            return NextResponse.json({ error: 'Could not find the product to delete.' }, { status: 404 });
        }

        // Add the main image key to our deletion list if it exists.
        if (product.image_key) {
            allImageKeysToDelete.push(product.image_key);
        }

        // Step 2: Find all secondary images for this product.
        const { data: secondaryImages, error: secondaryImagesError } = await supabase
            .from('product_secondary_images')
            .select('image_key')
            .eq('product_id', product.uuid);
        
        if (secondaryImagesError) {
            console.error('Error fetching secondary images for deletion:', secondaryImagesError.message);
            // We can still proceed to delete the main product, but this is a partial failure.
        }

        if (secondaryImages && secondaryImages.length > 0) {
            secondaryImages.forEach(img => allImageKeysToDelete.push(img.image_key));
        }

        // Step 3: Delete the product record from the database.
        // If you have "ON DELETE CASCADE" on your foreign key, this will also delete
        // the `product_secondary_images` records automatically.
        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('uuid', product.uuid);

        if (deleteError) {
            console.error('Error deleting product from database:', deleteError.message);
            return NextResponse.json({ error: `Database error: ${deleteError.message}` }, { status: 500 });
        }

        // Step 4: Delete all collected image files from R2 storage.
        if (allImageKeysToDelete.length > 0) {
            await Promise.allSettled(
                allImageKeysToDelete.map(key => 
                    deleteR2Object(key).catch(e => console.error(`Failed to delete ${key} from R2:`, e))
                )
            );
        }

        // Step 5: Revalidate paths to reflect the deletion in the UI.
        revalidatePath('/admin/products');
        revalidatePath('/products');

        return NextResponse.json({ message: 'Product and all associated images deleted successfully.' });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.error('An unexpected error occurred during deletion:', e.message);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}