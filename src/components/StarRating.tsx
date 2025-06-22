import React from "react";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
}

export function StarRating({ rating, onChange, readonly = false }: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
            key={star}
          type="button"
          onClick={() => onChange?.(star)}
          disabled={readonly}
          className={`text-xl ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          {star <= rating ? (
            <span className="text-[#FF6B35]">★</span>
          ) : (
            <span className="text-[#FF6B35]/30">☆</span>
          )}
        </button>
      ))}
    </div>
  );
}
