// components/ProductImageGallery.tsx
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  mainImageKey?: string | null;
  secondaryImages: { image_key: string }[];
}

export default function ProductImageGallery({ mainImageKey, secondaryImages }: ProductImageGalleryProps) {
  const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  const placeholderUrl = 'https://placehold.co/600x600/e2e8f0/94a3b8?text=Image';

  // Combine main and secondary images into a single, ordered list
  const allImages = useMemo(() => {
    const images: { image_key: string; }[] = [];
    if (mainImageKey) {
      images.push({ image_key: mainImageKey });
    }
    // Add secondary images, ensuring no duplicates if main image is also in secondary
    secondaryImages.forEach(img => {
      if (!images.find(i => i.image_key === img.image_key)) {
        images.push(img);
      }
    });
    return images;
  }, [mainImageKey, secondaryImages]);

  const [activeImageKey, setActiveImageKey] = useState<string | null>(allImages[0]?.image_key || null);

  const activeImageUrl = activeImageKey
    ? `${r2PublicUrl}/${activeImageKey}`
    : placeholderUrl;
    
  // Fallback for products with no images at all
  if (allImages.length === 0) {
    return (
      <div className="w-full aspect-square relative rounded-lg">
        <Image src={placeholderUrl} alt="Product image placeholder" fill sizes="100vw" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 lg:gap-5">
      {/* Thumbnails Column */}
      <div className="md:col-span-1 order-2 md:order-1">
        <div className="flex md:flex-col gap-2 overflow-x-scroll p-2">
          {allImages.map(({ image_key }) => (
            <button
              key={image_key}
              onClick={() => setActiveImageKey(image_key)}
              // Set a fixed width/height for mobile, and let flexbox handle desktop
              className={`w-16 h-16 md:w-full md:h-auto aspect-square rounded-md overflow-hidden relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-shrink-0 ${
                activeImageKey === image_key ? 'ring-2 ring-blue-600' : 'ring-1 ring-gray-300'
              }`}
            >
              <Image
                src={`${r2PublicUrl}/${image_key}`}
                alt="Product thumbnail"
                fill
                sizes="(max-width: 768px) 20vw, 10vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Image Column */}
      <div className="md:col-span-4 order-1 md:order-2">
        <div className="aspect-square relative bg-gray-100 rounded-lg overflow-scroll ">
          <Image
            src={activeImageUrl}
            alt="Main product view"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover transition-opacity duration-300"
            key={activeImageKey} // Force re-render on image change for smooth transition
          />
        </div>
      </div>
    </div>
  );
}