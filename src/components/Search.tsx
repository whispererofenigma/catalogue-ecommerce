// components/Search.tsx
'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';


type SearchResult = {
  name: string;
  slug: string;
  image_key: string | null;
  price: number;
};

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Debounce function remains the same
  type FetchFunctionType = (searchQuery: string) => void;

  const debounce = (func: FetchFunctionType, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null;

    // The returned function is also explicitly typed to match.
    return (searchQuery: string) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(searchQuery);
      }, delay);
    };
  };

  const fetchResults = async (searchQuery: string) => {
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
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchResults = useCallback(debounce(fetchResults, 300), []);

  useEffect(() => {
    debouncedFetchResults(query);
  }, [query, debouncedFetchResults]);

  // --- NEW: Handler for submitting the search (e.g., pressing Enter) ---
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.length > 1) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // --- NEW: Handler for clicking a suggestion ---
  const handleSuggestionClick = (product: SearchResult) => {
    // We pass both the original query and the highlighted slug
    router.push(`/search?q=${encodeURIComponent(query)}&highlight=${product.slug}`);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
      {isLoading && <p className="absolute w-full mt-1 text-center text-gray-500">Searching...</p>}
      {query.length > 1 && !isLoading && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {results.length > 0 ? (
            results.map((product) => (
              <li
                key={product.slug}
                className="border-b last:border-b-0 cursor-pointer"
                onClick={() => handleSuggestionClick(product)} // Changed from <Link> to onClick
              >
                <div className="flex items-center p-2 hover:bg-gray-100">
                  {/* Image would go here */}
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
  );
}