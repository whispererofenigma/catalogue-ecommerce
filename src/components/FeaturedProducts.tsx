// components/FeaturedProducts.tsx
import { createClient } from "@/utils/supabase/server";
import ProductCard from "./ProductCard";
import Link from 'next/link';

export default async function FeaturedProducts() {
  const supabase = await createClient();

  // Fetch the 4 most recently updated products
  const { data: products } = await supabase
    .from('products')
    .select('name, slug, price, product_assets(asset_key)')
    .order('last_updated', { ascending: false })
    .limit(4);

  return (
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
            image_key: product.product_assets[0]?.asset_key || null
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
  );
}