// app/categories/[slug]/loading.tsx

export default function Loading() {
  // This skeleton loader is designed to mimic the single category page layout.
  // It provides a visual placeholder for the category title, description,
  // and the grid of products, enhancing the user experience during data fetching.

  return (
    <main className="container mx-auto px-4 py-8 animate-pulse">
      {/* Category Title Skeleton */}
      <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-md w-1/2 mb-3"></div>
      
      {/* Category Description Skeleton */}
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-8"></div>
      
      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* Create an array of 8-12 elements for a realistic product grid placeholder. */}
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {/* Product Image Placeholder */}
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            <div className="mt-4">
              {/* Product Name Placeholder */}
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              {/* Product Price Placeholder */}
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
