// components/ReviewCard.tsx
import Image from '@/components/NextImage';
import { Star } from 'lucide-react'; // A popular icon library, run `npm install lucide-react`

// Define the types for our review data
type ReviewImage = {
  uuid: string;
  image_key: string;
};

export type Review = {
  uuid: string;
  rating: number;
  reviewer_name: string;
  title: string | null;
  body: string | null;
  created_at: string;
  review_images: ReviewImage[];
};

interface ReviewCardProps {
  review: Review;
}

// A helper component to render the star rating
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={`h-5 w-5 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};

export default function ReviewCard({ review }: ReviewCardProps) {
  const reviewDate = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="p-4 rounded-lg bg-gray-50 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ">
      <div className="flex gap-2 items-center mb-4">
        {/* You can add user avatars here in the future */}
        <div className="font-medium">
          <p>{review.reviewer_name}</p>
        </div>
        <StarRating rating={review.rating} />
      </div>
      
        {review.title && <h3 className="text-sm font-semibold text-gray-900">{review.title}</h3>}
      
      <footer className="mb-5 text-sm text-gray-500">
        <p>Reviewed on <time dateTime={review.created_at}>{reviewDate}</time></p>
      </footer>
      <div className="prose prose-sm max-w-none text-gray-600">
        <p>{review.body}</p>
      </div>
      {review.review_images && review.review_images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.review_images.map((image) => (
            <a key={image.uuid} href={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${image.image_key}`} target="_blank" rel="noopener noreferrer">
              <Image
                src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${image.image_key}`}
                alt="Customer review image"
               
                className="rounded-lg object-cover h-24 w-24 hover:opacity-80 transition-opacity"
              />
            </a>
          ))}
        </div>
      )}
    </article>
  );
}