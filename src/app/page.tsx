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
    .order('priority', { ascending: true, nullsFirst: false }) // or nullsLast: true    
    .limit(4);
  return categories || [];
}

export const metadata = {
  title: "Design Anything Online | Enter the Realm of Customisation",
  description: "Shop high-quality customizable products at Design Anything Online. From custom T-shirts and coffee mugs to photo frames, we bring your vision to life. Based in Kolkata, serving creatives everywhere.",
  
  // Define a canonical URL for the homepage
  alternates: {
    canonical: '/',
  },

  // Open Graph tags for social media sharing (Facebook, LinkedIn, etc.)
  openGraph: {
    title: "Design Anything Online | Enter the Realm of Customisation",
    description: "High-quality customizable products like T-shirts, mugs, and more.",
    url: 'https://www.desinganything.online', // Replace with your actual domain
    siteName: 'Design Anything Online',
    // You should create a specific social sharing image for your brand
    images: [
      {
        url: 'https://www.designanything.online/logo.svg', // Replace with your actual domain and image path
       
        alt: 'Design Anything Online - Customizable Products',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter-specific card metadata
  twitter: {
    card: 'summary_large_image',
    title: "Design Anything Online | Enter the Realm of Customisation",
    description: "Shop high-quality customizable products at Design Anything Online. From custom T-shirts and coffee mugs to photo frames, we bring your vision to life.",
    images: ['https://www.designanything.online/logo.svg'], // Replace with your actual domain and image path
  },
};

export default async function HomePage() {
  const featuredCategories = await getFeaturedCategories();

  return (

    <main className="bg-gray-200">
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