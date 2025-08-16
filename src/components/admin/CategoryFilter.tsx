// components/admin/CategoryFilter.tsx
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

type Category = {
  uuid: string;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilterChange = (categorySlug: string) => {
    // --- THIS IS THE KEY CHANGE ---
    // Start with a blank set of parameters.
    const params = new URLSearchParams(); 
    
    // Only add the category parameter if a category is selected.
    if (categorySlug) {
      params.set('category', categorySlug);
    }
    // This ensures any existing 'q' parameter is removed.
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      onChange={(e) => handleFilterChange(e.target.value)}
      // Read the current category from the URL to set the default value
      defaultValue={searchParams.get('category')?.toString() || ''}
      className="w-full md:w-60 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Filter by category...</option>
      {categories.map((category) => (
        <option key={category.uuid} value={category.slug}>
          {category.name}
        </option>
      ))}
    </select>
  );
}