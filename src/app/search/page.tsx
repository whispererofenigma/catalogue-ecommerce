// app/search/page.tsx
'use client'; // <-- This is the most important change!

import { useEffect, useState } from 'react';
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

export default function SearchPage() {
  // Client-side hooks to get URL parameters
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const highlight = searchParams.get('highlight');
  
  

  // State to hold our data and loading status
  const [highlightedProduct, setHighlightedProduct] = useState<Product | null>(null);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs when the 'query' or 'highlight' in the URL changes
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

      } catch (err) { // <-- `err` is now of type `unknown` by default
        // We check if the thrown object is an actual Error
        if (err instanceof Error) {
          setError(err.message); // <-- Now it's safe to access .message
        } else {
          // Handle cases where a non-Error was thrown
          setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [query, highlight]); // Re-run when query or highlight changes

  if (isLoading) {
    return (
        <main className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Searching for: <span className="text-blue-600 italic">{query}</span></h1>
            <p>Loading...</p>
        </main>
    );
  }

  if (error) {
    return <main className="container mx-auto p-4"><p>Error: {error}</p></main>;
  }
  const placeholderImage = 'https://placehold.co/50x50/e2e8f0/94a3b8?text=Img';
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Search Results for: <span className="text-blue-600 italic">{query}</span>
      </h1>

      <div className="p-6 mb-8 bg-blue-50 border-2 border-blue-200 rounded-lg">
      {highlightedProduct && (
          <div>
            <Image className='rounded-xl' src={highlightedProduct.image_key ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${highlightedProduct.image_key}` : placeholderImage} alt={highlightedProduct.name} width={500} height={500} />
            <h2 className="text-3xl text-black font-bold">{highlightedProduct.name}</h2>
            <p className="text-lg text-green-500 mt-2">₹{highlightedProduct.price.toFixed(2)}</p>
            <p className="mt-4 text-gray-700">{highlightedProduct.description}</p>
          </div>
        )}

      <h2 className='text-2xl font-bold'>Checkout Similiar Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {otherProducts.map(product => (
          <div key={product.slug} className="border rounded-lg p-4 shadow">
              <Image src={product.image_key ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${product.image_key}` : placeholderImage} alt={product.name} width={500} height={500} />
             <h3 className="font-semibold text-lg">{product.name}</h3>
             <p className="text-green-500">₹{product.price.toFixed(2)}</p>
             <div>
              
             </div>
          </div>
        ))}
      </div>
      </div>

      {!highlightedProduct && otherProducts.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No products found matching your search.</p>
      )}
    </main>
  );
}