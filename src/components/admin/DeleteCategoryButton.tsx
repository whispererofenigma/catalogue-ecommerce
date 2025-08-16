// components/admin/DeleteCategoryButton.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function DeleteCategoryButton({ categorySlug }: { categorySlug: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this category? Products in this category will become uncategorized.");
    if (confirmed) {
      const response = await fetch(`/api/categories/${categorySlug}`, { method: 'DELETE' });
      if (response.ok) {
        alert("Category deleted successfully!");
        router.refresh();
      } else {
        const { error } = await response.json();
        alert(`Error: ${error}`);
      }
    }
  };

  return (
    <button onClick={handleDelete} className="text-red-600 hover:text-red-900 text-sm font-medium">
      Delete
    </button>
  );
}