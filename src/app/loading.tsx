// app/loading.tsx

export default function Loading() {
  // This loading skeleton is designed to mimic the layout of the HomePage.
  // It provides a better user experience by showing a preview of the page structure
  // while the data is being fetched.

  return (
    <div className="animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="w-full h-96 bg-gray-200 dark:bg-gray-700"></div>

      <div className="container mx-auto px-4 py-16">
        {/* Featured Products Section Skeleton */}
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-md w-1/3 mx-auto"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2 mx-auto mt-4"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Create an array of 8 elements to map over for the product cards */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              <div className="mt-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mt-2"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Categories Section Skeleton */}
        <section className="bg-gray-50 dark:bg-gray-800 -mx-4 mt-16 px-4 py-16">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-md w-1/3 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2 mx-auto mt-4"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Create an array of 4 elements for the category cards */}
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  <div className="w-full h-40 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-4 bg-white dark:bg-gray-900">
                    <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
