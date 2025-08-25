// app/products/page.tsx
import { createClient } from "@/utils/supabase/server";
import ProductCard from "@/components/ProductCard";
import PaginationControls from "@/components/PaginationControls";

// FIX #1: The type for searchParams is now explicitly a Promise.
interface ProductsPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // FIX #2: We must 'await' the searchParams promise to get the actual object.
  const resolvedSearchParams = await searchParams;

  const supabase = await createClient();

  // Now, we use the 'resolvedSearchParams' object for all lookups.
  const page = resolvedSearchParams['page'] ?? '1';
  const per_page = resolvedSearchParams['per_page'] ?? '12';

  const start = (Number(page) - 1) * Number(per_page);
  const end = start + Number(per_page) - 1;

  const { data: products, error } = await supabase
    .from('products')
    .select('name, slug, price, image_key')
    .order('priority', { ascending: true, nullsFirst: false }) // or nullsLast: true
    .order('last_updated', { ascending: false }) // Secondary sort for non-prioritized items
    .range(start, end);

  if (error) {
    console.error("Error fetching products:", error);
    return <p>Error loading products.</p>;
  }

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