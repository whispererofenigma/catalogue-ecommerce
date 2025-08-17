// app/products/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

// --- DYNAMIC METADATA FUNCTION (FOR SEO) ---
// This function runs on the server to generate metadata for the <head> tag.
// It uses your existing data fetching logic.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: product } = await supabase.from('products').select('*').eq('slug', slug).single();

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const siteName = "Xponent"; // Replace with your brand/site name
  const productImageUrl = product.image_key 
    ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${product.image_key}` 
    : 'https://placehold.co/1200x630/e2e8f0/94a3b8?text=Image';
   const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`;

  return {
    title: `${product.name} | ${siteName}`,
    description: product.description?.substring(0, 160) || 'Check out this amazing product.',
    alternates: {
        canonical: productUrl,
    },
    openGraph: {
      title: product.name,
      description: product.description || '',
      url: productUrl,
      siteName: siteName,
      images: [{ url: productImageUrl, width: 1200, height: 630, alt: product.name }],
      type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description || '',
        images: [productImageUrl],
    }
  };
}


// --- STATIC PAGE GENERATION (FROM YOUR ORIGINAL CODE) ---
export const dynamicParams = false;

export async function generateStaticParams() {
  const { data: products } = await supabase.from('products').select('slug');
  return products?.map((p) => ({ slug: p.slug })) ?? [];
}

// --- MAIN PAGE COMPONENT (WITH YOUR LOGIC + UI/SEO ENHANCEMENTS) ---
export default async function ProductPage({ params }: { params: { slug: string } }) {
  // Your original data fetching logic is kept exactly the same.
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!product) {
    notFound();
  }

  const productImageUrl = product.image_key 
    ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${product.image_key}` 
    : 'https://placehold.co/500x500/e2e8f0/94a3b8?text=Image';

  // --- STRUCTURED DATA (JSON-LD) FOR GOOGLE RICH SNIPPETS ---
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: productImageUrl,
    sku: product.uuid,
    brand: { '@type': 'Brand', name: 'Xponent' }, // Replace with your brand
    offers: {
        '@type': 'Offer',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`, // Use your full production URL
        priceCurrency: 'INR', // Change to your currency (e.g., USD, EUR)
        price: product.price,
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <>
      {/* This script tag is invisible to users but crucial for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb Navigation for UX and SEO */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-gray-700">Home</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link href="/products" className="hover:text-gray-700">Products</Link></li>
            <li><span className="mx-2">/</span></li>
            <li aria-current="page" className="font-medium text-gray-700 truncate">{product.name}</li>
          </ol>
        </nav>

        {/* Enhanced two-column UI layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Product Image Column */}
          <div className="w-full">
            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden shadow-md">
              <Image
                src={productImageUrl}
                alt={product.name}
                fill // Use 'fill' for responsive containers
                className='object-cover'
                sizes="(max-width: 768px) 100vw, 50vw" // Helps Next.js optimize image loading
                priority // Tells Next.js to load this image first (improves performance)
              />
            </div>
            {/* A placeholder for a future multi-image thumbnail gallery */}
          </div>

          {/* Product Details Column */}
          <div className='flex flex-col h-full'>
            <h1 className='text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900'>{product.name}</h1>
            
            <div className="mt-4 flex items-center gap-4">
              <p className="text-3xl tracking-tight text-gray-800">
                ₹{product.price.toFixed(2)}
              </p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                In Stock
              </span>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">About this product</h2>
              <div className="prose prose-lg text-gray-700 max-w-none">
                <p>{product.description}</p>
              </div>
            </div>

            <div className="mt-auto pt-8">
                <button className="w-full bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold text-lg shadow-md transition-colors duration-300">
                    Add to Cart
                </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
