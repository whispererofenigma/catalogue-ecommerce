// src/components/PurchaseButtonClient.tsx
'use client';

import { useState, useEffect, useMemo } from 'react'; // Import useMemo

// Define a type for the product prop for type safety
type Product = {
  name: string;
  slug: string;
  customisability?: boolean;
  sizes?: string | null;
};

interface PurchaseButtonProps {
  product: Product;
  customImage?: Blob | null;
  generatedDesignImage?: Blob | null;
}

export default function PurchaseButtonClient({ 
  product, 
  customImage: initialCustomImage,
  generatedDesignImage: initialGeneratedImage
}: PurchaseButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    pincode: '',
    state: ''
  });
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [customImage, setCustomImage] = useState<File | Blob | null>(initialCustomImage || null);
  const [generatedDesignImage] = useState<File | Blob | null>(initialGeneratedImage || null); // Removed unused setter

  // Memoize the availableSizes array to prevent re-creation on every render
  const availableSizes = useMemo(() => {
    return product.sizes ? product.sizes.split(',').map(s => s.trim()) : [];
  }, [product.sizes]);

  // Set default size if it's the only one
  useEffect(() => {
    if (availableSizes.length === 1) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCustomImage(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File | Blob, fileType: string): Promise<string> => {
    const presignedUrlResponse = await fetch('/api/r2/presigned-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileType }),
    });
    if (!presignedUrlResponse.ok) throw new Error('Failed to get presigned URL.');
    const { presignedUrl, objectKey } = await presignedUrlResponse.json();
    const uploadResponse = await fetch(presignedUrl, { method: 'PUT', body: file });
    if (!uploadResponse.ok) throw new Error('Failed to upload file to R2.');
    return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${objectKey}`;
  };

  const constructWhatsAppMessage = async () => {
    let originalImageUrl = '';
    let generatedImageUrl = '';

    if (customImage) {
      originalImageUrl = await uploadFile(customImage, customImage.type);
    }
    if (generatedDesignImage) {
      generatedImageUrl = await uploadFile(generatedDesignImage, generatedDesignImage.type);
    }

    const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`;

    const formattedAddress = `
---------------------
*Shipping Details:*
Name: ${address.name}
Phone: ${address.phone}
Address: ${address.street}, ${address.city}, ${address.state} - ${address.pincode}
---------------------
    `.trim();

    let message = `Hi! I'd like to place an order for this product:\n${productUrl}`;
    if (selectedSize) {
      message += `\nSize: ${selectedSize}`;
    }
    message += `\n\n${formattedAddress}`;
    if (originalImageUrl) {
      message += `\n\nOriginal Design: ${originalImageUrl}`;
    }
    if (generatedImageUrl) {
      message += `\n\nCustomized T-Shirt View: ${generatedImageUrl}`;
    }
    message += `\n\nPlease let me know the next steps for payment.`;

    return message;
  };

  const handleConfirmAndSend = async () => {
    if (availableSizes.length > 0 && !selectedSize) {
      alert("Please select a size.");
      return;
    }
    const message = await constructWhatsAppMessage();
    const whatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919563357911";
    const finalWhatsAppUrl = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`;
    window.open(finalWhatsAppUrl, '_blank');
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-center w-full bg-green-500 text-white hover:bg-green-600 px-8 py-4 rounded-lg font-bold text-lg shadow-md transition-transform hover:scale-101"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" className="w-8 h-8 mr-3"><path d="M476.9 161.1C435 119.1 379.2 96 319.9 96C197.5 96 97.9 195.6 97.9 318C97.9 357.1 108.1 395.3 127.5 429L96 544L213.7 513.1C246.1 530.8 282.6 540.1 319.8 540.1L319.9 540.1C442.2 540.1 544 440.5 544 318.1C544 258.8 518.8 203.1 476.9 161.1zM319.9 502.7C286.7 502.7 254.2 493.8 225.9 477L219.2 473L149.4 491.3L168 423.2L163.6 416.2C145.1 386.8 135.4 352.9 135.4 318C135.4 216.3 218.2 133.5 320 133.5C369.3 133.5 415.6 152.7 450.4 187.6C485.2 222.5 506.6 268.8 506.5 318.1C506.5 419.9 421.6 502.7 319.9 502.7zM421.1 364.5C415.6 361.7 388.3 348.3 383.2 346.5C378.1 344.6 374.4 343.7 370.7 349.3C367 354.9 356.4 367.3 353.1 371.1C349.9 374.8 346.6 375.3 341.1 372.5C308.5 356.2 287.1 343.4 265.6 306.5C259.9 296.7 271.3 297.4 281.9 276.2C283.7 272.5 282.8 269.3 281.4 266.5C280 263.7 268.9 236.4 264.3 225.3C259.8 214.5 255.2 216 251.8 215.8C248.6 215.6 244.9 215.6 241.2 215.6C237.5 215.6 231.5 217 226.4 222.5C221.3 228.1 207 241.5 207 268.8C207 296.1 226.9 322.5 229.6 326.2C232.4 329.9 268.7 385.9 324.4 410C359.6 425.2 373.4 426.5 391 423.9C401.7 422.3 423.8 410.5 428.4 397.5C433 384.5 433 373.4 431.6 371.1C430.3 368.6 426.6 367.2 421.1 364.5z"/></svg>
        Purchase on WhatsApp
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <h2 className="text-2xl font-bold mb-4">Confirm Your Order</h2>
            <form className="space-y-4">
              {availableSizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Size</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 border rounded-md text-sm ${
                          selectedSize === size
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <input type="text" name="name" placeholder="Full Name" required className="w-full p-2 border rounded" value={address.name} onChange={handleInputChange} />
              <input type="tel" name="phone" placeholder="Phone Number" required className="w-full p-2 border rounded" value={address.phone} onChange={handleInputChange} />
              <textarea name="street" placeholder="Street Address, House No." required className="w-full p-2 border rounded" value={address.street} onChange={handleInputChange} />
              <div className="flex gap-4">
                <input type="text" name="city" placeholder="City" required className="w-1/2 p-2 border rounded" value={address.city} onChange={handleInputChange} />
                <input type="text" name="pincode" placeholder="Pincode" required className="w-1/2 p-2 border rounded" value={address.pincode} onChange={handleInputChange} />
              </div>
              <input type="text" name="state" placeholder="State" required className="w-full p-2 border rounded" value={address.state} onChange={handleInputChange} />
              
              {product.customisability && !initialCustomImage && (
                <div>
                  <label htmlFor="customImage" className="block text-sm font-medium text-gray-700">Custom Image</label>
                  <input id="customImage" type="file" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded text-gray-700 border hover:bg-gray-100">Cancel</button>
                <button 
                  type="button" 
                  onClick={handleConfirmAndSend} 
                  disabled={availableSizes.length > 0 && !selectedSize}
                  className="px-6 py-2 rounded bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400"
                >
                  Confirm & Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}