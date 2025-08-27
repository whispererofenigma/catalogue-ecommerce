// app/admin/reviews/page.tsx
import { createClient } from "@/utils/supabase/server";
import AddReviewForm from "@/components/admin/AddReviewForm";

// This Server Component fetches the initial data needed for the form.
export default async function AddReviewPage() {
  const supabase = await createClient();

  // Fetch all products to populate a dropdown menu.
  const { data: products, error } = await supabase
    .from('products')
    .select('uuid, name, slug')
    .order('name', { ascending: true });

  if (error) {
    return <p>Error loading products. Cannot add a review at this time.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Add a New Customer Review</h1>
      {/* We pass the fetched products to our interactive form component. */}
      <AddReviewForm products={products || []} />
    </div>
  );
}