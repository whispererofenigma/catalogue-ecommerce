import Image from "next/image";
import Search from '@/components/Search';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24">
      <h1 className="text-4xl font-bold mb-8">Search Our Products</h1>
      <Search />
      {/* Other homepage components will go here later */}
    </main>
  );
}
