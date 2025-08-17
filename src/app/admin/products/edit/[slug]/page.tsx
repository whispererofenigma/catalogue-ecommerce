// app/admin/products/edit/[slug]/page.tsx
import ProductForm from '@/components/admin/ProductForm';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

// Define the Category type for type safety

async function getPageData(slug: string) {
    const supabase = await createClient();

    // Fetch the product and the categories in parallel for efficiency
    const productPromise = supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();
        
    const categoriesPromise = supabase
        .from('categories')
        .select('uuid, name')
        .order('name');

    // Await both promises
    const [ { data: product, error: productError }, { data: categories, error: categoriesError } ] = await Promise.all([
      productPromise,
      categoriesPromise
    ]);

    if (productError || categoriesError) {
        console.error("Failed to fetch page data:", productError || categoriesError);
        return { product: null, categories: [] };
    }
    
    return { product, categories: categories || [] };
}

export default async function EditProductPage({ params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const { product, categories } = await getPageData(slug);

  if (!product) {
    notFound(); // Use notFound() for better 404 handling
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Edit: {product.name}</h1>
      <ProductForm initialData={product} categories={categories} isEditing={true} />
    </div>
  );
}