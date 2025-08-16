// components/PaginationControls.tsx
'use client'; // This component uses hooks for interactivity

import { useSearchParams, useRouter } from 'next/navigation';
import { FC } from 'react';

interface PaginationControlsProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const PaginationControls: FC<PaginationControlsProps> = ({
  hasNextPage,
  hasPrevPage,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams.get('page') ?? '1';
  const per_page = searchParams.get('per_page') ?? '12';

  return (
    <div className='flex gap-2 justify-center items-center mt-8'>
      <button
        className='bg-gray-700 text-white p-2 rounded-md disabled:bg-gray-400'
        disabled={!hasPrevPage}
        onClick={() => {
          router.push(`/products?page=${Number(page) - 1}&per_page=${per_page}`);
        }}>
        prev page
      </button>

      <div>
        {page}
      </div>

      <button
        className='bg-gray-700 text-white p-2 rounded-md disabled:bg-gray-400'
        disabled={!hasNextPage}
        onClick={() => {
          router.push(`/products?page=${Number(page) + 1}&per_page=${per_page}`);
        }}>
        next page
      </button>
    </div>
  );
};

export default PaginationControls;