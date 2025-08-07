// components/ProductForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

// Define the Product type based on your table
type Product = {
  uuid?: string;
  name: string;
  description: string;
  price: number;
  slug?: string;
  image_key?: string | null;
};

interface ProductFormProps {
  initialData?: Product | null; // Product data for editing
  isEditing?: boolean;
}

export default function ProductForm({ initialData = null, isEditing = false }: ProductFormProps) {
  const [product, setProduct] = useState<Product>(
    initialData || { name: '', description: '', price: 0 }
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
    setIsSubmitting(true);

    let finalImageKey = initialData?.image_key;
    let oldImageKeyToDelete = null;

    // 1. If a new image is selected, upload it to R2
    if (imageFile) {
      // a. Get a presigned URL from our API
      const presignedUrlResponse = await fetch('/api/r2/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType: imageFile.type }),
      });
      
      if (!presignedUrlResponse.ok) {
        console.error("Failed to get presigned URL from server.");
        const errorText = await presignedUrlResponse.text(); 
        console.error("Server responded with:", errorText);
        alert("Error: Could not get upload URL from server. Check the console for details.");
        setIsSubmitting(false);
        return; // Stop the function here
      }
      
      const { presignedUrl, objectKey } = await presignedUrlResponse.json();
      
      // b. Upload the file directly to R2 using the presigned URL
      try {
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          body: imageFile,
          // The 'headers' property has been removed as per Cloudflare docs
        });

        if (!uploadResponse.ok) {
            console.error("Upload to R2 failed.", await uploadResponse.text());
            alert(`Error: File upload to storage failed with status ${uploadResponse.status}. Check console for details.`);
            setIsSubmitting(false);
            return; // Stop the submission if upload fails
        }

      } catch (e) {
        console.error("Caught a network error during the R2 upload fetch call:", e);
        alert("A network error occurred during the upload. Check the console, your internet connection, and any browser extensions.");
        setIsSubmitting(false);
        return; // Stop the submission
      }
      
      finalImageKey = objectKey;
      // If we are editing and there was a previous image, mark it for deletion
      if (isEditing && initialData?.image_key) {
          oldImageKeyToDelete = initialData.image_key;
      }
    }

    const payload = {
      name: product.name,
      description: product.description,
      price: product.price,
      image_key: finalImageKey,
      // Pass the old key so the API route can delete it
      ...(isEditing && oldImageKeyToDelete && { oldImageKey: oldImageKeyToDelete }),
    };

    // 2. Upsert product data to Supabase via our API route
    const apiEndpoint = isEditing ? `/api/products/${initialData?.slug}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(apiEndpoint, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert(`Product ${isEditing ? 'updated' : 'created'} successfully!`);
      router.push('/admin/products'); // Redirect to product list
      router.refresh(); // Invalidate Next.js cache
    } else {
      const { error } = await response.json();
      alert(`Error: ${error}`);
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... Form fields for name, description, price ... */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium">Name</label>
        <input
          id="name"
          type="text"
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium">Description</label>
        <textarea
          id="description"
          value={product.description}
          onChange={(e) => setProduct({ ...product, description: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium">Price</label>
        <input
          id="price"
          type="number"
          
          value={product.price}
          onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })}
          required
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium">Product Image</label>
        <input id="image" type="file" accept="image/*" onChange={handleImageChange} />
        {initialData?.image_key && !imageFile && (
           <p>Current image is set. Choose a new file to replace it.</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
      </button>
    </form>
  );
}