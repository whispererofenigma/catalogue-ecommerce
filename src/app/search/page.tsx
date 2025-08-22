// app/search/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard'; // Assuming this path is correct

// --- Types (as before) ---
type Product = {
  name: string;
  slug: string;
  image_key: string | null;
  price: number;
  description: string;
};

// --- NEW: Skeleton Component for a single Product Card ---
function ProductCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white border border-gray-200">
      <div className="relative w-full h-60 bg-gray-200 animate-pulse"></div>
      <div className="p-4">
        <div className="h-6 w-3/4 mb-2 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-5 w-1/4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

// --- REFINED: Skeleton Component for the entire Search Page ---
function SearchPageSkeleton({ query }: { query: string | null }) {
  const _q = query
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="h-10 bg-gray-200 rounded-md w-3/4 max-w-lg mb-12 animate-pulse"></div>
      <div className="h-8 bg-gray-200 rounded-md w-1/3 max-w-sm mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}

// --- Main Page Component ---
export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const highlight = searchParams.get("highlight");

  const [highlightedProduct, setHighlightedProduct] = useState<Product | null>(null);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ q: query });
        if (highlight) {
          params.append('highlight', highlight);
        }
        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        const data = await response.json();
        setHighlightedProduct(data.highlightedProduct);
        setOtherProducts(data.otherProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [query, highlight]);

  // --- UPDATED RENDER LOGIC ---

  // 1. Show skeleton on any loading state
  if (isLoading) {
    return <SearchPageSkeleton query={query} />;
  }

  // 2. Show error message if an error occurred
  if (error) {
    return (
      <main className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-gray-600">{error}</p>
      </main>
    );
  }

  const hasResults = highlightedProduct || otherProducts.length > 0;

  // 3. Render the results or a "no results" message
  return (
    <main className="container mx-auto px-4 py-8">
      {/* General Search Title (only shows if there's no specific highlighted product) */}
      {!highlightedProduct && (
        <h1 className="text-4xl font-extrabold text-gray-900 mb-12">
          Search Results for: <span className="text-indigo-600 italic">{query}</span>
        </h1>
      )}

      {/* Highlighted Product Section - Layout Fixed */}
      {highlightedProduct && (
        <section className="mb-12">
          <h2 className='text-3xl font-bold text-green-500 mb-6'>
            Your Selection
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"> 
            <ProductCard product={highlightedProduct} />
          </div>
        </section>
      )}

      {/* Other Matching Products Section */}
      {otherProducts.length > 0 && (
        <section>
          <h2 className='text-3xl font-bold text-gray-900 mb-6'>
            {highlightedProduct ? 'Similar Products' : 'All Matching Products'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {otherProducts.map(product => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* No Results Message */}
      {!hasResults && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-800">No products found</h2>
          <p className="text-gray-500 mt-2">Try adjusting your search terms or check back later.</p>
        </div>
      )}
    </main>
  );
}