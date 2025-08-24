// components/CategoryCard.tsx
import Link from 'next/link';
import Image from '@/components/NextImage';

type Category = {
  name: string;
  slug: string;
  description?: string | null;
  thumbnail_key?: string | null;
};

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {

  const thumbUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${category.thumbnail_key}`;
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="block rounded-lg p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
    >

      <div className="relative aspect-square w-full p-2">
        <Image
          src={thumbUrl}
          alt={category.name}
        
          style={{ objectFit: 'cover', objectPosition: 'center',}}
          
        />
      </div>


      <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
      {category.description && (
        <p className="mt-2 text-gray-600">{category.description}</p>
      )}
    </Link>
  );
}