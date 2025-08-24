// components/ProductCard.tsx
import Link from 'next/link';
import Image from '@/components/NextImage';

type Product = {
  name: string;
  slug: string;
  price: number;
  image_key: string | null;
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.image_key
    ? `https://cdn.xponentfunds.in/${product.image_key}` // Construct the full image URL
    : '/placeholder-image.png'; // A fallback image in your /public folder

  return (
    <Link
      href={`/products/${product.slug}`}
      className="block rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
    >
      <div className="relative aspect-square w-full">
        <Image
          src={imageUrl}
          alt={product.name}
          
          style={{ objectFit: 'cover', objectPosition: 'center'}}
          
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 truncate">{product.name}</h3>
        <p className="text-gray-600 mt-1">₹{product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}