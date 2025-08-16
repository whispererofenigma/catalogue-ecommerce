// components/ProductForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

// Define the types for our props and data
type Product = {
  uuid?: string;
  name: string;
  description: string;
  price: number;
  slug?: string;
  image_key?: string | null;
  category_id?: string | null; // <-- Added category_id
};

type Category = {
  uuid: string;
  name: string;
};

interface ProductFormProps {
  initialData?: Product | null;
  categories: Category[]; // <-- Added categories prop
  isEditing?: boolean;
}

export default function ProductForm({ initialData = null, categories, isEditing = false }: ProductFormProps) {
  const [product, setProduct] = useState<Product>(
    initialData || { name: '', description: '', price: 0, category_id: null }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!product.category_id) {
        alert("Please select a category.");
        return;
    }
    setIsSubmitting(true);

    let finalImageKey = initialData?.image_key;
    let oldImageKeyToDelete = null;

    if (imageFile) {
      // ... (Image upload logic remains the same)
      const presignedUrlResponse = await fetch('/api/r2/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType: imageFile.type }),
      });
      if (!presignedUrlResponse.ok) { /* ... error handling ... */ return; }
      const { presignedUrl, objectKey } = await presignedUrlResponse.json();
      try {
        const uploadResponse = await fetch(presignedUrl, { method: 'PUT', body: imageFile });
        if (!uploadResponse.ok) { /* ... error handling ... */ return; }
      } catch (_e) { /* ... error handling ... */ return; }
      finalImageKey = objectKey;
      if (isEditing && initialData?.image_key) {
          oldImageKeyToDelete = initialData.image_key;
      }
    }

    // --- Updated payload to include category_id ---
    const payload = {
      name: product.name,
      description: product.description,
      price: product.price,
      image_key: finalImageKey,
      category_id: product.category_id, // <-- The new field
      ...(isEditing && oldImageKeyToDelete && { oldImageKey: oldImageKeyToDelete }),
    };

    // Upsert logic remains the same
    const apiEndpoint = isEditing ? `/api/products/${initialData?.slug}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';
    const response = await fetch(apiEndpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert(`Product ${isEditing ? 'updated' : 'created'} successfully!`);
      router.push('/admin/products');
      router.refresh();
    } else {
      const { error } = await response.json();
      alert(`Error: ${error}`);
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input id="name" type="text" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
      </div>
      
      {/* --- NEW CATEGORY DROPDOWN --- */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
        <select
          id="category"
          value={product.category_id || ''}
          onChange={(e) => setProduct({ ...product, category_id: e.target.value })}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="" disabled>Select a category</option>
          {categories.map((category) => (
            <option key={category.uuid} value={category.uuid}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea id="description" value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
        <input id="price" type="number" step="0.01" value={product.price} onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Product Image</label>
        <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
        {initialData?.image_key && !imageFile && (
           <p className="mt-2 text-sm text-gray-500">Current image is set. Choose a new file to replace it.</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
        {isSubmitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
      </button>
    </form>
  );
}