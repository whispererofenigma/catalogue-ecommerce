// components/FeaturedProducts.tsx
import { createClient } from "@/utils/supabase/server";
import ProductCard from "./ProductCard";
import Link from 'next/link';
import { Suspense } from "react";

export default async function FeaturedProducts() {
  const supabase = await createClient();

  // Fetch the 4 most recently updated products
  const { data: products } = await supabase
    .from('products')
    .select('name, slug, price, image_key')
    .order('priority', { ascending: true, nullsFirst: false }) // or nullsLast: true
    .order('last_updated', { ascending: false }) // Secondary sort for non-prioritized items
    .limit(4);

  return (
    <Suspense fallback={<div className="border rounded-2xl p-4 shadow-sm animate-pulse">
      <div className="bg-gray-200 h-40 w-full rounded-xl mb-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>}>
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Featured Products</h2>
          <p className="mt-2 text-gray-600">Check out our latest and greatest creations.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products?.map(product => {
            // A little data transformation to fit the ProductCard props
            const productForCard = {
              ...product,
              image_key: product.image_key || null
            };
            return <ProductCard key={product.slug} product={productForCard} />;
          })}
        </div>
        <div className="text-center mt-12">
          <Link href="/products" className="text-blue-600 hover:text-blue-800 font-semibold">
            View All Products &rarr;
          </Link>
        </div>
      </section>
    </Suspense>
  );
}