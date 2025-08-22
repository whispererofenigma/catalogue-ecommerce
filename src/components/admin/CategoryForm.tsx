// components/admin/CategoryForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from '@/components/NextImage';

type Category = {
  uuid?: string;
  name: string;
  description?: string | null;
  slug?: string;
  thumbnail_key?: string | null;
};

interface CategoryFormProps {
  initialData?: Category | null;
  isEditing?: boolean;
}

export default function CategoryForm({ initialData = null, isEditing = false }: CategoryFormProps) {
  const [category, setCategory] = useState<Category>(initialData || { name: '', description: '' });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let finalThumbnailKey = initialData?.thumbnail_key;
    let oldThumbnailKeyToDelete = null;

    if (thumbnailFile) {
      // Re-use the exact same R2 upload logic as the product form
      const presignedUrlResponse = await fetch('/api/r2/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType: thumbnailFile.type }),
      });
      if (!presignedUrlResponse.ok) { /* ... error handling ... */ setIsSubmitting(false); return; }
      const { presignedUrl, objectKey } = await presignedUrlResponse.json();
      try {
        const uploadResponse = await fetch(presignedUrl, { method: 'PUT', body: thumbnailFile });
        if (!uploadResponse.ok) { /* ... error handling ... */ setIsSubmitting(false); return; }
      } catch (_err) { /* ... error handling ... */ setIsSubmitting(false); return; }
      
      finalThumbnailKey = objectKey;
      if (isEditing && initialData?.thumbnail_key) {
        oldThumbnailKeyToDelete = initialData.thumbnail_key;
      }
    }

    const payload = {
      name: category.name,
      description: category.description,
      thumbnail_key: finalThumbnailKey,
      ...(isEditing && oldThumbnailKeyToDelete && { oldThumbnailKey: oldThumbnailKeyToDelete }),
    };

    const apiEndpoint = isEditing ? `/api/categories/${initialData?.slug}` : '/api/categories';
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(apiEndpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert(`Category ${isEditing ? 'updated' : 'created'} successfully!`);
      router.push('/admin');
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Category Name</label>
        <input id="name" type="text" value={category.name} onChange={(e) => setCategory({ ...category, name: e.target.value })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea id="description" value={category.description || ''} onChange={(e) => setCategory({ ...category, description: e.target.value })} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
      </div>
      <div>
        <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">Thumbnail Image</label>
        {initialData?.thumbnail_key && (
            <div className="mt-2">
                <p className="text-sm text-gray-500 mb-2">Current Thumbnail:</p>
                <Image src={`https://cdn.xponentfunds.in/${initialData.thumbnail_key}`} alt="Current thumbnail" width={100} height={100} className="rounded-md object-cover"/>
            </div>
        )}
        <input id="thumbnail" type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files ? e.target.files[0] : null)} className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full justify-center py-2 px-4 border rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
        {isSubmitting ? 'Saving...' : (isEditing ? 'Update Category' : 'Create Category')}
      </button>
    </form>
  );
}