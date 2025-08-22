// app/categories/loading.tsx

export default function Loading() {
  // This loading skeleton mimics the layout of the CategoriesPage.
  // It provides a seamless transition for the user by showing a placeholder
  // where the content will eventually appear.

  return (
    <main className="container mx-auto px-4 py-8 animate-pulse">
      {/* Page Title Skeleton */}
      <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-md w-1/3 mb-8"></div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Create an array of 6-9 elements to map over. This provides a realistic
          number of placeholder cards while the actual data loads.
        */}
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Image Placeholder */}
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-4">
              {/* Title Placeholder */}
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              {/* Description Placeholder */}
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mt-1"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
