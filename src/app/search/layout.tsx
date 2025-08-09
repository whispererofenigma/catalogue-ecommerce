import { Suspense } from 'react';

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      {children}
    </Suspense>
  );
}
