// app/products/loading.tsx

// We can define the skeleton component directly in the loading file
// to avoid any import path issues during the build process.
function ProductCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden shadow-lg bg-white">
      {/* Image Placeholder */}
      <div className="w-full h-64 bg-gray-200 animate-pulse"></div>
      
      <div className="p-4">
        {/* Title Placeholder */}
        <div className="h-6 w-3/4 mb-2 bg-gray-200 rounded animate-pulse"></div>
        
        {/* Price Placeholder */}
        <div className="h-5 w-1/4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}


export default function Loading() {
  // This loading UI will be displayed automatically by Next.js
  // while the data for the products page is being fetched on the server.
  // It's helpful to mirror the final page's layout for a seamless transition.
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">All Products</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* Render a number of skeleton cards that matches your default page size.
          In your case, the per_page default is 12.
        */}
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
      
      {/* We don't include the PaginationControls in the loading state 
        because their visibility (e.g., hasNextPage) depends on the data 
        that is currently being fetched.
      */}
    </main>
  );
}
