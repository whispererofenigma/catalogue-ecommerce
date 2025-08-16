// app/admin/page.tsx
'use client'; // <-- This converts it to a Client Component and solves the error

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import CategoryFilter from "@/components/admin/CategoryFilter";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";

// Define the types for our data
type Product = {
  uuid: string;
  name: string;
  price: number;
  slug: string;
  image_key: string | null;
  categories: { name: string } | null; // Corrected type: it's an object, not an array
};
type Category = {
  uuid: string;
  name: string;
  slug: string;
  thumbnail_key: string | null;
};

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This function runs whenever the URL search params change
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams(searchParams.toString());
        const response = await fetch(`/api/admin/products?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        
        const data = await response.json();
        setProducts(data.products);
        setCategories(data.categories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [searchParams]); // Re-fetch whenever searchParams changes

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-4xl font-extrabold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-4">
            <Link href="/admin/products/new" className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold shadow-sm">
              + Add New Product
            </Link>
            <Link href="/admin/categories/new" className="bg-gray-700 text-white hover:bg-gray-800 px-5 py-2 rounded-lg font-semibold shadow-sm">
              + Add New Category
            </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Manage Products</h2>
            <div className="flex flex-col md:flex-row gap-4">
                <AdminSearchInput />
                <CategoryFilter categories={categories} />
            </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading products...</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length > 0 ? products.map((product) => (
                  <tr key={product.uuid}>
                    <td className="px-6 py-4">
                      {product.image_key ? (<Image src={`https://cdn.xponentfunds.in/${product.image_key}`} alt={product.name} width={50} height={50} className="rounded-md object-cover h-12 w-12"/>) : <div className="h-12 w-12 bg-gray-200 rounded-md"/>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.categories?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <Link href={`/admin/products/edit/${product.slug}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                      <DeleteProductButton productSlug={product.slug} />
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500">No products found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
         <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Categories</h2>
         {isLoading ? <p className="text-center py-4 text-gray-500">Loading categories...</p> : (
           <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.uuid} className="py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {category.thumbnail_key ? (<Image src={`https://cdn.xponentfunds.in/${category.thumbnail_key}`} alt={category.name} width={40} height={40} className="rounded-md object-cover h-10 w-10"/>) : <div className="h-10 w-10 bg-gray-200 rounded-md"/>}
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="space-x-4">
                   <Link href={`/admin/categories/edit/${category.slug}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</Link>
                   <DeleteCategoryButton categorySlug={category.slug} />
                </div>
              </li>
            ))}
          </ul>
         )}
      </div>
    </div>
  );
}