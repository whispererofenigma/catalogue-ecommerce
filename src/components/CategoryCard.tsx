// components/CategoryCard.tsx
import Link from 'next/link';

type Category = {
  name: string;
  slug: string;
  description?: string | null;
};

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link 
      href={`/categories/${category.slug}`} 
      className="block border rounded-lg p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
    >
      <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
      {category.description && (
        <p className="mt-2 text-gray-600">{category.description}</p>
      )}
    </Link>
  );
}