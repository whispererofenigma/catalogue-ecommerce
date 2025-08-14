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

// This is the fully corrected, type-safe debounce utility function.
// It correctly infers the arguments of the function passed to it.
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


export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 1. Make `fetchResults` stable with `useCallback`. This is safe because
  // its dependencies are React state setters, which never change.
  const fetchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: SearchResult[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Failed to fetch search results:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // An empty dependency array is correct and makes this function stable.

  // 2. The linter can't analyze HOFs like `debounce`, so we disable the rule for this line.
  // This is now safe because `fetchResults` is stable and we pass an empty dependency array,
  // ensuring the debounced function is created only once.
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
    }
  };

  const handleSuggestionClick = (product: SearchResult) => {
    router.push(`/search?q=${encodeURIComponent(query)}&highlight=${product.slug}`);
    setQuery('');
    setResults([]);
  };

  return (
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
      {isLoading && <p className="absolute w-full mt-1 text-center text-gray-500">Searching...</p>}
      {query.length > 1 && !isLoading && (
        <ul className="absolute z-10 w-full mt-1 list-none bg-white border border-gray-300 rounded-lg shadow-lg">
          {results.length > 0 ? (
            results.map((product) => (
              <li
                key={product.slug}
                className="border-b last:border-b-0 cursor-pointer"
                onClick={() => handleSuggestionClick(product)}
              >
                <div className="flex items-center p-2 hover:bg-gray-100">
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