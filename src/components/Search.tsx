'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type SearchResult = {
  name: string;
  slug: string;
  image_key: string | null;
  price: number;
};

// 1. Define the props interface for our component
interface SearchProps {
  // This prop is optional, so the desktop version doesn't need to provide it.
  onSearchComplete?: () => void;
}

const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  delay: number
) => {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: T): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// 2. Accept the `onSearchComplete` prop
export default function Search({ onSearchComplete }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data: SearchResult[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Failed to fetch search results:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debouncing logic remains the same
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchResults = useCallback(debounce(fetchResults, 300), []);

  useEffect(() => {
    debouncedFetchResults(query);
  }, [query, debouncedFetchResults]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 1) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setResults([]);
      
      // 3. Conditionally call the callback to close the mobile search view
      if (onSearchComplete) {
        onSearchComplete();
      }
    }
  };

  const handleSuggestionClick = (product: SearchResult) => {
    // Navigate to the product or a highlighted search page
    router.push(`/search?q=${encodeURIComponent(query)}&highlight=${product.slug}`);
    setQuery('');
    setResults([]);
    
    // 3. Also call it here when a suggestion is clicked
    if (onSearchComplete) {
      onSearchComplete();
    }
  };

  return (
    // The className="relative" is important for positioning the results dropdown
    <div className="relative w-full max-w-lg">
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
        />
      </form>
      
      {/* The results dropdown logic remains the same */}
      {query.length > 1 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {isLoading ? (
             <div className="p-2 text-center text-gray-500">Searching...</div>
          ) : (
            <ul>
              {results.length > 0 ? (
                results.map((product) => (
                  <li
                    key={product.slug}
                    className="border-b last:border-b-0 cursor-pointer"
                    onClick={() => handleSuggestionClick(product)}
                  >
                    <div className="flex items-center p-2 hover:bg-gray-100">
                      {/* Optional: Add image here if you have it */}
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-2 text-gray-500">{`No results found for "${query}".`}</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}