import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Review } from "@/lib/types";

const LOCAL_REVIEWS = "spicy-masala-reviews";

const initialReviews: Review[] = [
  {
    id: "review-1",
    productId: "masala-1",
    userName: "Priya Sharma",
    rating: 5,
    comment: "Absolutely amazing! This garam masala transformed my cooking. The aroma is incredible and it tastes just like my grandmother's blend.",
    createdAt: "2024-06-10T10:30:00Z"
  },
  {
    id: "review-2",
    productId: "masala-1",
    userName: "Raj Patel",
    rating: 4,
    comment: "Great quality spices. Very authentic taste. Will definitely order again!",
    createdAt: "2024-06-08T15:45:00Z"
  },
  {
    id: "review-3",
    productId: "masala-2",
    userName: "Sarah Johnson",
    rating: 5,
    comment: "Perfect for tandoori dishes! The smoky flavor is exactly what I was looking for. Highly recommended.",
    createdAt: "2024-06-12T09:20:00Z"
  },
  {
    id: "review-4",
    productId: "masala-3",
    userName: "Amit Kumar",
    rating: 4,
    comment: "Love this on fruit salads! Adds such a unique and delicious flavor. Kids love it too.",
    createdAt: "2024-06-05T14:15:00Z"
  }
];

interface ReviewContextType {
  reviews: Review[];
  addReview: (review: Omit<Review, "id" | "createdAt" | "adminReply">) => void;
  replyToReview: (reviewId: string, reply: string) => void;
  removeReview: (reviewId: string) => void;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_REVIEWS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return initialReviews;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_REVIEWS, JSON.stringify(reviews));
    } catch (e) {
      // ignore
    }
  }, [reviews]);

  const addReview = (review: Omit<Review, "id" | "createdAt" | "adminReply">) => {
    setReviews((prev) => [
      {
        ...review,
        id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const replyToReview = (reviewId: string, reply: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, adminReply: reply } : r
      )
    );
  };

  const removeReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  return (
    <ReviewContext.Provider value={{ reviews, addReview, replyToReview, removeReview }}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewContext);
  if (!context) throw new Error("useReviews must be used within a ReviewProvider");
  return context;
} 