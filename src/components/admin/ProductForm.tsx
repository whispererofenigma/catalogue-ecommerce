// components/admin/ProductForm.tsx
'use client';

import { useState, FormEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Define the types for props and data
type Product = {
  uuid?: string;
  name: string;
  description: string;
  price: number;
  slug?: string;
  image_key?: string | null;
  category_id?: string | null;
};

type Category = {
  uuid: string;
  name: string;
};

type SecondaryImage = {
  uuid: string;
  image_key: string;
  display_order: number;
};

interface ProductFormProps {
  initialData?: Product | null;
  categories: Category[];
  secondaryImages?: SecondaryImage[];
  isEditing?: boolean;
}

export default function ProductForm({ 
  initialData = null, 
  categories, 
  secondaryImages = [], 
  isEditing = false 
}: ProductFormProps) {
  const [product, setProduct] = useState<Product>(
    initialData || { name: '', description: '', price: 0, category_id: null }
  );
  
  // State for main image management
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [isMainImageDeleted, setIsMainImageDeleted] = useState(false);

  // State for secondary images management
  const [currentSecondaryImages, setCurrentSecondaryImages] = useState(secondaryImages);
  const [newSecondaryImageFiles, setNewSecondaryImageFiles] = useState<File[]>([]);
  const [keysToDelete, setKeysToDelete] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

  const newImagePreviews = useMemo(() => {
    return newSecondaryImageFiles.map(file => URL.createObjectURL(file));
  }, [newSecondaryImageFiles]);


  // --- IMAGE HANDLERS ---

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImageFile(e.target.files[0]);
      setIsMainImageDeleted(false); // If user selects a new file, undo deletion
    }
  };

  const handleDeleteMainImage = () => {
    setIsMainImageDeleted(true);
    setMainImageFile(null); // Clear any staged file
  };

  const handleSecondaryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewSecondaryImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeNewSecondaryImage = (index: number) => {
    setNewSecondaryImageFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const deleteExistingSecondaryImage = (image: SecondaryImage) => {
    setKeysToDelete(prev => [...prev, image.image_key]);
    setCurrentSecondaryImages(prev => prev.filter(img => img.uuid !== image.uuid));
  };


  // --- FORM SUBMISSION LOGIC ---

  const uploadFile = async (file: File): Promise<string> => {
    const presignedUrlResponse = await fetch('/api/r2/presigned-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileType: file.type }),
    });

    if (!presignedUrlResponse.ok) throw new Error('Failed to get presigned URL.');
    const { presignedUrl, objectKey } = await presignedUrlResponse.json();
    
    const uploadResponse = await fetch(presignedUrl, { method: 'PUT', body: file });
    if (!uploadResponse.ok) throw new Error('Failed to upload file to R2.');
    return objectKey;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!product.category_id) {
        alert("Please select a category.");
        return;
    }
    setIsSubmitting(true);

    try {
      let finalMainImageKey = initialData?.image_key;
      let oldMainImageKeyToDelete = null;

      // 1. Determine main image action
      if (isMainImageDeleted) {
        finalMainImageKey = null;
        if (initialData?.image_key) {
          oldMainImageKeyToDelete = initialData.image_key;
        }
      } else if (mainImageFile) {
        finalMainImageKey = await uploadFile(mainImageFile);
        if (isEditing && initialData?.image_key) {
          oldMainImageKeyToDelete = initialData.image_key;
        }
      }

      // 2. Upload new secondary images
      const newSecondaryImageKeys = await Promise.all(
        newSecondaryImageFiles.map(file => uploadFile(file))
      );

      // 3. Construct the final payload
      const payload = {
        productData: {
          name: product.name,
          description: product.description,
          price: product.price,
          image_key: finalMainImageKey,
          category_id: product.category_id,
        },
        imageActions: {
          oldMainImageKeyToDelete,
          newSecondaryImageKeys,
          deletedSecondaryImageKeys: keysToDelete,
        }
      };

      // 4. Send to the API
      const apiEndpoint = isEditing ? `/api/products/${initialData?.slug}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetch(apiEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(`Product ${isEditing ? 'updated' : 'created'} successfully!`);
        router.push('/admin');
        router.refresh();
      } else {
        const { error } = await response.json();
        throw new Error(error);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch(error: any) {
        alert(`Error: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md">
      {/* Product Details Section */}
      <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input id="name" type="text" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select id="category" value={product.category_id || ''} onChange={(e) => setProduct({ ...product, category_id: e.target.value })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              <option value="" disabled>Select a category</option>
              {categories.map((category) => (<option key={category.uuid} value={category.uuid}>{category.name}</option>))}
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
      </div>
      
      {/* Main Image Section */}
      <div className="space-y-4 border-t pt-8">
        <h3 className="text-lg font-medium text-gray-900">Main Product Image</h3>
        
        {isEditing && initialData?.image_key && !isMainImageDeleted && (
          <div className="relative group w-40 h-40">
            <Image src={`${r2PublicUrl}/${initialData.image_key}`} alt="Current main product image" width={160} height={160} className="rounded-md object-cover aspect-square"/>
            <button type="button" onClick={handleDeleteMainImage} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 leading-none" title="Delete Main Image">
              &times;
            </button>
          </div>
        )}
        
        {isMainImageDeleted && <p className="text-sm text-red-600">Main image will be removed upon saving.</p>}

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">{initialData?.image_key ? 'Upload New to Replace' : 'Upload Image'}</label>
          <input id="image" type="file" accept="image/*" onChange={handleMainImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
        </div>
      </div>

      {/* Secondary Images Section */}
      <div className="space-y-4 border-t pt-8">
        <h3 className="text-lg font-medium text-gray-900">Secondary Images</h3>
        
        <div className="min-h-[100px] grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Existing Images */}
          {currentSecondaryImages.map((image) => (
            <div key={image.uuid} className="relative group w-full">
              <Image src={`${r2PublicUrl}/${image.image_key}`} alt="Secondary product image" width={150} height={150} className="w-full rounded-md object-cover aspect-square"/>
              <button type="button" onClick={() => deleteExistingSecondaryImage(image)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 leading-none" title="Delete Image">&times;</button>
            </div>
          ))}
          {/* New Image Previews */}
          {newImagePreviews.map((previewUrl, index) => (
            <div key={index} className="relative group w-full">
              <Image src={previewUrl} alt={`New image ${index+1}`} width={150} height={150} className="w-full rounded-md object-cover aspect-square"/>
              <button type="button" onClick={() => removeNewSecondaryImage(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 leading-none opacity-0 group-hover:opacity-100 transition-opacity" title="Remove">&times;</button>
            </div>
          ))}
        </div>
        
        <div>
          <label htmlFor="secondary_images" className="block text-sm font-medium text-gray-700">Add More Images</label>
          <input id="secondary_images" type="file" multiple accept="image/*" onChange={handleSecondaryImagesChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
        </div>
      </div>

      <div className="pt-6">
        <button type="submit" disabled={isSubmitting} className="w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
          {isSubmitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
        </button>
      </div>
    </form>
  );
}