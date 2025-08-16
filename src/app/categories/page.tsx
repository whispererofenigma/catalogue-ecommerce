// app/categories/page.tsx
import { createClient } from "@/utils/supabase/server";
import CategoryCard from "@/components/CategoryCard";

// This is a server component, so we can make it async and fetch data directly.
export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('categories')
    // --- THIS LINE IS NOW CORRECTED ---
    .select('uuid, name, slug, description')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    // You could return a more user-friendly error message here
    return <p>Error loading categories.</p>;
  }

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