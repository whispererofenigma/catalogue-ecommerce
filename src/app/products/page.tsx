// app/products/page.tsx


import { createClient } from "@/utils/supabase/server";
import ProductCard from "@/components/ProductCard";
import PaginationControls from "@/components/PaginationControls";



// Define the type for searchParams for clarity
interface ProductsPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

// This is a server component, so we can make it async
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  
  const supabase = await createClient();

  // Now, we use the 'resolvedSearchParams' object for all lookups.
  const page = resolvedSearchParams['page'] ?? '1';
  const per_page = resolvedSearchParams['per_page'] ?? '12';

  const start = (Number(page) - 1) * Number(per_page);
  const end = start + Number(per_page) - 1;
  
  // Fetch the products for the current page
  const { data: products, error } = await supabase
    .from('products')
    .select('name, slug, price, image_key')
    .order('last_updated', { ascending: false }) // Show newest products first
    .range(start, end);

  if (error) {
    console.error("Error fetching products:", error);
    return <p>Error loading products.</p>;
  }
  
  // --- Check if there are next/previous pages ---
  // To check for a next page, we see if there's at least one more product after our current range.
  // We only need to know if it exists, so we select a minimal column and limit to 1.
  const { data: nextPageData } = await supabase
    .from('products')
    .select('uuid', { count: 'exact' })
    .range(end + 1, end + 2);
    
  const hasNextPage = nextPageData ? nextPageData.length > 0 : false;
  const hasPrevPage = start > 0;

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">All Products</h1>
      
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No products found.</p>
      )}

      <PaginationControls hasNextPage={hasNextPage} hasPrevPage={hasPrevPage} />
    </main>
  );
}