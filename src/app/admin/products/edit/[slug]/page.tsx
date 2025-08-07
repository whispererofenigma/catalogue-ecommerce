// app/admin/products/edit/[slug]/page.tsx
import ProductForm from '@/components/ProductForm';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

async function getProduct(slug: string) {
    const cookieStore = cookies();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error("Failed to fetch product:", error);
        return null;
    }
    return data;
}

// Fix: The params object is now a Promise and must be awaited.
export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await the params to get the slug string
  const { slug } = await params;
  
  const product = await getProduct(slug);

  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit: {product.name}</h1>
      <ProductForm initialData={product} isEditing={true} />
    </div>
  );
}