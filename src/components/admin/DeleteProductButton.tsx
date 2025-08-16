// components/admin/DeleteProductButton.tsx
'use client';

import { useRouter } from 'next/navigation';

interface DeleteProductButtonProps {
  productSlug: string;
}

export default function DeleteProductButton({ productSlug }: DeleteProductButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    // 1. Show a confirmation dialog before deleting
    const confirmed = window.confirm("Are you sure you want to delete this product? This action cannot be undone.");

    if (confirmed) {
      try {
        const response = await fetch(`/api/products/${productSlug}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || "Failed to delete the product.");
        }

        alert("Product deleted successfully!");
        // 2. Refresh the page to update the list of products
        router.refresh();

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error("Deletion failed:", errorMessage);
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-900 font-medium"
    >
      Delete
    </button>
  );
}