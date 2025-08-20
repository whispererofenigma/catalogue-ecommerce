// app/search/page.tsx
'use client'; // This must remain a client component due to hooks like useState and useEffect
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

// Define a type for our product data
type Product = {
  name: string;
  slug: string;
  image_key: string | null;
  price: number;
  description: string;
};

// --- Skeleton Component for Loading State ---
// Defined within this file to keep it self-contained.
function SearchPageSkeleton({ query }: { query: string | null }) {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
        Searching for: <span className="text-indigo-600 italic">{query}</span>
      </h1>
      
      {/* Highlighted Product Skeleton */}
      <div className="p-6 mb-8 bg-gray-50 border border-gray-200 rounded-lg animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 rounded-lg w-full h-80"></div>
          <div>
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>

      {/* Other Products Skeleton */}
      <div>
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden bg-white">
              <div className="w-full h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-6 w-3/4 mb-2 bg-gray-200 rounded"></div>
                <div className="h-5 w-1/4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}


export default function SearchPage() {
   const searchParams = useSearchParams()
  // derive params reactively
  const query = searchParams.get("q");
  const highlight = searchParams.get("highlight");

  const [highlightedProduct, setHighlightedProduct] = useState<Product | null>(null);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Effect to fetch data when 'query' or 'highlight' changes
  useEffect(() => {
    if (!query) {
      setIsLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let url = `/api/search?q=${encodeURIComponent(query)}`;
        if (highlight) {
          url += `&highlight=${encodeURIComponent(highlight)}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        const data = await response.json();
        
        setHighlightedProduct(data.highlightedProduct);
        setOtherProducts(data.otherProducts);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [query, highlight]);

  if (isLoading) {
    return <SearchPageSkeleton query={query} />;
  }

  if (error) {
    return (
      <main className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-gray-600">{error}</p>
      </main>
    );
  }
  
  const placeholderImage = 'https://placehold.co/500x500/e2e8f0/94a3b8?text=Image';
  const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL // Using a placeholder for the env variable
  const hasResults = highlightedProduct || otherProducts.length > 0;

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
        Search Results for: <span className="text-indigo-600 italic">{query}</span>
      </h1>

      {highlightedProduct && (
        <div className="p-6 md:p-8 mb-12 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <Image 
              className='rounded-lg w-full h-auto object-cover aspect-square' 
              src={highlightedProduct.image_key ? `${r2PublicUrl}/${highlightedProduct.image_key}` : placeholderImage} 
              alt={highlightedProduct.name} 
              width="500" 
              height="500"
            />
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900">{highlightedProduct.name}</h2>
              <p className="text-3xl tracking-tight text-gray-800 mt-2">₹{highlightedProduct.price.toFixed(2)}</p>
              <p className="mt-6 text-base text-gray-700">{highlightedProduct.description}</p>
            </div>
          </div>
        </div>
      )}

      {otherProducts.length > 0 && (
        <div>
          <h2 className='text-3xl font-bold text-gray-900 mb-6'>
            {highlightedProduct ? 'Similar Products' : 'All Matching Products'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {otherProducts.map(product => (
              <a key={product.slug} href={`/products/${product.slug}`} className="group">
                <div className="border rounded-lg overflow-hidden shadow-lg transition-transform duration-300 ease-in-out transform hover:-translate-y-1 bg-white h-full flex flex-col">
                  <div className="relative w-full h-48">
                    <Image 
                      src={product.image_key ? `${r2PublicUrl}/${product.image_key}` : placeholderImage} 
                      alt={product.name} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                      loading="lazy"
                      width="500"
                      height="500"
                    />
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="font-semibold text-lg text-gray-800 flex-grow">{product.name}</h3>
                    <p className="text-indigo-600 font-medium mt-2">₹{product.price.toFixed(2)}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {!hasResults && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-800">No products found</h2>
          <p className="text-gray-500 mt-2">Try adjusting your search terms or check back later.</p>
        </div>
      )}
    </main>
  );
}
