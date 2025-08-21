// app/admin/products/edit/[slug]/page.tsx
import ProductForm from '@/components/admin/ProductForm';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

// Define types for better type safety and clarity


async function getPageData(slug: string) {
    const supabase = await createClient();

    // Step 1: Fetch the product first to get its UUID.
    const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

    // If product doesn't exist, we can stop here.
    if (productError || !product) {
        console.error("Failed to fetch product:", productError);
        return { product: null, categories: [], secondaryImages: [] };
    }

    // Step 2: Now that we have the product UUID, fetch its categories and secondary images in parallel.
    const categoriesPromise = supabase
        .from('categories')
        .select('uuid, name')
        .order('name');
        
    const secondaryImagesPromise = supabase
        .from('product_secondary_images')
        .select('uuid, image_key, display_order')
        .eq('product_id', product.uuid) // Use the fetched product's UUID
        .order('display_order');

    const [
      { data: categories, error: categoriesError },
      { data: secondaryImages, error: imagesError }
    ] = await Promise.all([categoriesPromise, secondaryImagesPromise]);
    
    if (categoriesError || imagesError) {
        console.error("Failed to fetch categories or secondary images:", categoriesError || imagesError);
    }
    
    return { 
      product, 
      categories: categories || [], 
      secondaryImages: secondaryImages || [] 
    };
}

export default async function EditProductPage({ params,
}: {
  params: Promise<{ slug: string }> // Correctly typed: The params object itself is not a promise
}) {
  const { slug } = await params;
  const { product, categories, secondaryImages } = await getPageData(slug);

  if (!product) {
    notFound(); // Use notFound() for better 404 handling
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Edit: {product.name}</h1>
      <ProductForm 
        initialData={product} 
        categories={categories} 
        secondaryImages={secondaryImages} // <-- Pass the images to the form
        isEditing={true} 
      />
    </div>
  );
}