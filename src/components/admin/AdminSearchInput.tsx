// components/admin/AdminSearchInput.tsx
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function AdminSearchInput() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    // --- THIS IS THE KEY CHANGE ---
    // Start with a blank set of parameters.
    const params = new URLSearchParams();

    // Only add the search parameter if there is a search term.
    if (term) {
      params.set('q', term);
    }
    // This ensures any existing 'category' parameter is removed.
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative">
      <label htmlFor="search" className="sr-only">Search</label>
      <input
        type="text"
        placeholder="Search by product name..."
        onChange={(e) => handleSearch(e.target.value)}
        // Read the current query from the URL to set the default value
        defaultValue={searchParams.get('q')?.toString() || ''}
        className="w-full md:w-80 pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}