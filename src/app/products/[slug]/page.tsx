// app/products/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import Image from 'next/image';


export const dynamicParams = false;

// Define a type for the dynamic route parameters


export async function generateStaticParams() {
  const { data: products } = await supabase.from('products').select('slug');
  return products?.map((p) => ({ slug: p.slug })) ?? [];
}

// Apply the type to the component props
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {


  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', (await params).slug)
    .single();

  if (!product) {
    notFound();
  }

  const productImage = `https://cdn.xponentfunds.in/${product.image_key}`

  return (
    <div className='p-8 flex flex-wrap gap-4'>
      <div className='flex justify-center w-full md:w-auto md:justify-start'>
        <Image
          src={productImage}
          alt={product.name}
          width={500}
          height={500}
          className='rounded-xl' // Set explicit width and height to prevent layout shift
        />
        </div>
        <div className='text-left'>
          <h1 className='text-3xl font-bold'>{product.name}</h1>
          <p>{product.description}</p>
          <h2 className='text-2xl text-green-500'>${product.price}</h2>
        </div>
    </div>
    
  );
}