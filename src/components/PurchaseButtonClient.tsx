// components/PurchaseButtonClient.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

// Define a type for the product prop for type safety
type Product = {
  name: string;
  slug: string;
};

interface PurchaseButtonProps {
  product: Product;
}

export default function PurchaseButtonClient({ product }: PurchaseButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    pincode: '',
    state: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const constructWhatsAppMessage = () => {
    const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`;

    const formattedAddress = `
---------------------
*Shipping Details:*
Name: ${address.name}
Phone: ${address.phone}
Address: ${address.street}, ${address.city}, ${address.state} - ${address.pincode}
---------------------
    `.trim();

    return `Hi! I'd like to place an order for this product:\n${productUrl}\n\n${formattedAddress}\n\nPlease let me know the next steps for customization and payment.`;
  };

  const whatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919563357911";
  const finalWhatsAppUrl = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(constructWhatsAppMessage())}`;

  return (
    <>
      {/* The main button that opens the modal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-center w-full bg-green-500 text-white hover:bg-green-600 px-8 py-4 rounded-lg font-bold text-lg shadow-md transition-transform hover:scale-101"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" className="w-8 h-8 mr-3"><path d="M476.9 161.1C435 119.1 379.2 96 319.9 96C197.5 96 97.9 195.6 97.9 318C97.9 357.1 108.1 395.3 127.5 429L96 544L213.7 513.1C246.1 530.8 282.6 540.1 319.8 540.1L319.9 540.1C442.2 540.1 544 440.5 544 318.1C544 258.8 518.8 203.1 476.9 161.1zM319.9 502.7C286.7 502.7 254.2 493.8 225.9 477L219.2 473L149.4 491.3L168 423.2L163.6 416.2C145.1 386.8 135.4 352.9 135.4 318C135.4 216.3 218.2 133.5 320 133.5C369.3 133.5 415.6 152.7 450.4 187.6C485.2 222.5 506.6 268.8 506.5 318.1C506.5 419.9 421.6 502.7 319.9 502.7zM421.1 364.5C415.6 361.7 388.3 348.3 383.2 346.5C378.1 344.6 374.4 343.7 370.7 349.3C367 354.9 356.4 367.3 353.1 371.1C349.9 374.8 346.6 375.3 341.1 372.5C308.5 356.2 287.1 343.4 265.6 306.5C259.9 296.7 271.3 297.4 281.9 276.2C283.7 272.5 282.8 269.3 281.4 266.5C280 263.7 268.9 236.4 264.3 225.3C259.8 214.5 255.2 216 251.8 215.8C248.6 215.6 244.9 215.6 241.2 215.6C237.5 215.6 231.5 217 226.4 222.5C221.3 228.1 207 241.5 207 268.8C207 296.1 226.9 322.5 229.6 326.2C232.4 329.9 268.7 385.9 324.4 410C359.6 425.2 373.4 426.5 391 423.9C401.7 422.3 423.8 410.5 428.4 397.5C433 384.5 433 373.4 431.6 371.1C430.3 368.6 426.6 367.2 421.1 364.5z"/></svg>
        Purchase on WhatsApp
      </button>

      {/* The Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <h2 className="text-2xl font-bold mb-4">Shipping Details</h2>
            <p className="text-sm text-gray-600 mb-6">Please provide your address to proceed.</p>
            <form className="space-y-4">
              <input type="text" name="name" placeholder="Full Name" required className="w-full p-2 border rounded" value={address.name} onChange={handleInputChange} />
              <input type="tel" name="phone" placeholder="Phone Number" required className="w-full p-2 border rounded" value={address.phone} onChange={handleInputChange} />
              <textarea name="street" placeholder="Street Address, House No." required className="w-full p-2 border rounded" value={address.street} onChange={handleInputChange} />
              <div className="flex gap-4">
                <input type="text" name="city" placeholder="City" required className="w-1/2 p-2 border rounded" value={address.city} onChange={handleInputChange} />
                <input type="text" name="pincode" placeholder="Pincode" required className="w-1/2 p-2 border rounded" value={address.pincode} onChange={handleInputChange} />
              </div>
              <input type="text" name="state" placeholder="State" required className="w-full p-2 border rounded" value={address.state} onChange={handleInputChange} />
              
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded text-gray-700 border hover:bg-gray-100">Cancel</button>
                <Link href={finalWhatsAppUrl} target="_blank" className="px-6 py-2 rounded bg-green-500 text-white hover:bg-green-600">
                  Confirm & Send
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}