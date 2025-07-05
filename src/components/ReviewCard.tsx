import React from "react";
import { StarRating } from "./StarRating";
import { Review } from "@/lib/types";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-[#F9F7F1] p-4 rounded-xl shadow-lg border-2 border-[#FF6B35]/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-bold text-lg text-[#2F2F2F] mb-1">{review.userName}</h4>
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={review.rating} readonly />
            <span className="text-sm text-[#FF6B35] font-medium">
              {formatDate(review.createdAt)}
            </span>
          </div>
          <p className="text-[#2F2F2F] text-sm leading-relaxed">{review.comment}</p>
        </div>
        {review.verified && (
          <span className="bg-[#6FBF73] text-white text-xs px-2 py-1 rounded-full font-medium">
            Verified Purchase
          </span>
        )}
      </div>
      {review.response && (
        <div className="mt-3 pl-4 border-l-2 border-[#FF6B35]">
          <p className="text-sm text-[#2F2F2F]">
            <span className="font-semibold text-[#FF6B35]">Response from Shree Mahalaxmi:</span>
            <br />
            {review.response}
          </p>
        </div>
      )}
      {review.adminReply && (
        <div className="mt-3 pl-4 border-l-2 border-green-600">
          <p className="text-sm text-green-800">
            <span className="font-semibold text-green-700">Admin Reply:</span>
            <br />
            {review.adminReply}
          </p>
        </div>
      )}
    </div>
  );
}
