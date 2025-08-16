// app/admin/categories/new/page.tsx
import CategoryForm from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Add New Category</h1>
      <CategoryForm />
    </div>
  );
}