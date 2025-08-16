// app/categories/[slug]/page.tsx
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";



export default async function CategoryPage({ params,
}: {
  params: Promise<{ slug: string }>
}) {
  const supabase = await createClient();

  // This is the magic of Supabase: we can query the category and "join"
  // its related products in a single, efficient API call.
  const { data: category, error } = await supabase
    .from('categories')
    .select(`
      name,
      description,
      products ( name, slug, price, image_key )
    `)
    .eq('slug', (await params).slug)
    .single(); // .single() expects one result and returns an object instead of an array

  // If no category is found for the given slug, show a 404 page.
  if (error || !category) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{category.name}</h1>
      {category.description && <p className="text-lg text-gray-600 mb-8">{category.description}</p>}
      
      {category.products && category.products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {category.products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-12">No products found in this category yet.</p>
      )}
    </main>
  );
}