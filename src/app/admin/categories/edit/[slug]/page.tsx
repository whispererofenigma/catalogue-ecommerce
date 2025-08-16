// app/admin/categories/edit/[slug]/page.tsx
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import CategoryForm from "@/components/admin/CategoryForm";

async function getCategory(slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).single();
    if (error) { notFound(); }
    return data;
}

export default async function EditCategoryPage({ params,
}: {
  params: Promise<{ slug: string }>
}) {
  // We can access 'slug' directly without 'await'.
  const { slug } = await params; 
  const category = await getCategory(slug);
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Edit: {category.name}</h1>
      <CategoryForm initialData={category} isEditing={true} />
    </div>
  );
}