// components/Hero.tsx
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative bg-gray-900 text-white">
      {/* You can replace this with a high-quality background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40" 
        style={{ backgroundImage: "url('/hero_bg.jpg')" }}
      ></div>
      
      <div className="relative container mx-auto px-4 py-24 md:py-32 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Your Ideas, Perfectly Printed
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">
          From custom t-shirts to personalized mugs, we bring your vision to life with high-quality products and vibrant prints.
        </p>
        <div className="mt-8">
          <Link 
            href="/products" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105"
          >
            Shop All Products
          </Link>
        </div>
      </div>
    </div>
  );
}