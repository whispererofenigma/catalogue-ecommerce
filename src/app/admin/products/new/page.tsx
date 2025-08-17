// app/admin/products/new/page.tsx
import ProductForm from '@/components/admin/ProductForm';
import { createClient } from '@/utils/supabase/server';

type Category = {
  uuid: string;
  name: string;
};

async function getCategories(): Promise<Category[]> {
    const supabase = await createClient();
    const { data: categories, error } = await supabase
        .from('categories')
        .select('uuid, name')
        .order('name');

    if (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
    return categories || [];
}

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}