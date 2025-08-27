// components/admin/AddReviewForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type Product = {
  uuid: string;
  name: string;
  slug: string;
};

interface AddReviewFormProps {
  products: Product[];
}

export default function AddReviewForm({ products }: AddReviewFormProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
        alert("Please select a product.");
        return;
    }
    setIsSubmitting(true);

    // 1. Upload all selected image files to R2
    const uploadedImageKeys: string[] = [];
    if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file) => {
            const presignedUrlResponse = await fetch('/api/r2/presigned-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileType: file.type }),
            });
            if (!presignedUrlResponse.ok) throw new Error('Failed to get presigned URL');
            const { presignedUrl, objectKey } = await presignedUrlResponse.json();
            await fetch(presignedUrl, { method: 'PUT', body: file });
            uploadedImageKeys.push(objectKey);
        });

        try {
            await Promise.all(uploadPromises);
        } catch (_err) {
            alert("An error occurred during image upload. Please try again.");
            setIsSubmitting(false);
            return;
        }
    }

    // 2. Prepare the payload for our new API route
    const selectedProduct = products.find(p => p.uuid === selectedProductId);
    const payload = {
        reviewData: {
            product_id: selectedProductId,
            reviewer_name: reviewerName,
            rating: rating,
            title: title,
            body: body,
        },
        imageKeys: uploadedImageKeys,
        productSlug: selectedProduct?.slug, // Pass slug for revalidation
    };

    // 3. Send the review data to the server
    const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (response.ok) {
        alert('Review added successfully!');
        router.push('/admin'); // Redirect back to the main dashboard
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
        <label htmlFor="product" className="block text-sm font-medium text-gray-700">Product</label>
        <select id="product" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
          <option value="" disabled>Select a product to review...</option>
          {products.map((product) => (
            <option key={product.uuid} value={product.uuid}>{product.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label htmlFor="reviewerName" className="block text-sm font-medium text-gray-700">Reviewer Name</label>
            <input id="reviewerName" type="text" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
        </div>
        <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
            <input id="rating" type="number" min="1" max="5" value={rating} onChange={(e) => setRating(parseInt(e.target.value))} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Review Title</label>
        <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700">Review Body</label>
        <textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
      </div>

      <div>
        <label htmlFor="images" className="block text-sm font-medium text-gray-700">Review Images</label>
        <input id="images" type="file" accept="image/*" multiple onChange={(e) => setImageFiles(e.target.files ? Array.from(e.target.files) : [])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full justify-center py-3 px-4 border rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}