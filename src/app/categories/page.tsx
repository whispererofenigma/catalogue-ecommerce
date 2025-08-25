// app/categories/page.tsx
import { createClient } from "@/utils/supabase/server";
import CategoryCard from "@/components/CategoryCard";


async function getFeaturedCategories() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('uuid, name, slug, description, thumbnail_key');
    
  return categories || [];
}


// This is a server component, so we can make it async and fetch data directly.
export default async function CategoriesPage() {
  const categories = await getFeaturedCategories();

  

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">All Categories</h1>
      
      {categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            // This key prop will now work correctly
            <CategoryCard key={category.uuid} category={category} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No categories found.</p>
      )}
    </main>
  );
}