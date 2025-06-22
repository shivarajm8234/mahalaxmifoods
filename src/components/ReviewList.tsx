import { Review } from "@/lib/types";
import { ReviewCard } from "./ReviewCard";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to review!
      </div>
    );
  }

  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-brand-gold">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">
              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </div>
            <div className="h-2 bg-gray-100 rounded-full mt-2">
              <div 
                className="h-full bg-brand-gold rounded-full"
                style={{ width: `${(averageRating / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
} 