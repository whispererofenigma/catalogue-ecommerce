// components/ReviewsSection.tsx
import ReviewCard, { Review } from './ReviewCard';
import { Star } from 'lucide-react';

interface ReviewsSectionProps {
  reviews: Review[];
  productName: string;
}

export default function ReviewsSection({ reviews, productName }: ReviewsSectionProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <section className="container mx-auto py-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Customer Reviews</h2>
        <p className="mt-4 text-gray-500">Be the first to review {`"${productName}"`}!</p>
      </section>
    );
  }

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <section className="container mx-auto py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Customer Reviews</h2>
        <div className="mt-3 flex items-center">
            <p className="text-sm text-gray-700">
              {averageRating.toFixed(1)}
              <span className="sr-only"> out of 5 stars</span>
            </p>
            <div className="ml-1 flex items-center">
              {[0, 1, 2, 3, 4].map((rating) => (
                <Star
                  key={rating}
                  className={`h-5 w-5 flex-shrink-0 ${averageRating > rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                />
              ))}
            </div>
            <p className="ml-2 text-sm text-gray-500">{reviews.length} reviews</p>
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        {reviews.map((review) => (
          <ReviewCard key={review.uuid} review={review} />
        ))}
      </div>
    </section>
  );
}
// You'll need to import Star from lucide-react here as well if you see an error
// import { Star } from 'lucide-react';