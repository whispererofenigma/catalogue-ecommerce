// app/page.tsx
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import { createClient } from "@/utils/supabase/server";
import CategoryCard from "@/components/CategoryCard";
import Link from "next/link";
import { Suspense } from "react";
// Helper function to fetch a few categories for the homepage
async function getFeaturedCategories() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('uuid, name, slug, description, thumbnail_key')
    .limit(3);
  return categories || [];
}

export default async function HomePage() {
  const featuredCategories = await getFeaturedCategories();
  
  return (
    
    <main>
      <Hero />
      <FeaturedProducts />

      {/* Explore Categories Section */}
      <Suspense>
        <section className="bg-gray-50">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">Explore Our Categories</h2>
              <p className="mt-2 text-gray-600">Find exactly what you are looking for.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredCategories.map((category) => (
                <CategoryCard key={category.uuid} category={category} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/categories" className="text-blue-600 hover:text-blue-800 font-semibold">
                View All Categories &rarr;
              </Link>
            </div>
          </div>
        </section>
      </Suspense>

    </main>
  );
}