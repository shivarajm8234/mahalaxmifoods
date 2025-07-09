import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Review } from "@/lib/types";
import { db } from '@/firebase/config';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

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
  addReview: (review: Omit<Review, "id" | "createdAt" | "adminReply"> & { userId: string }) => Promise<void>;
  replyToReview: (reviewId: string, reply: string) => Promise<void>;
  removeReview: (reviewId: string) => Promise<void>;
  removeAdminReply: (reviewId: string) => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
    });
    return () => unsub();
  }, []);

  const addReview = async (review: Omit<Review, "id" | "createdAt" | "adminReply"> & { userId: string }) => {
    await addDoc(collection(db, 'reviews'), {
      ...review,
      createdAt: new Date().toISOString(),
    });
  };

  const replyToReview = async (reviewId: string, reply: string) => {
    await updateDoc(doc(db, 'reviews', reviewId), { adminReply: reply });
  };

  const removeReview = async (reviewId: string) => {
    await deleteDoc(doc(db, 'reviews', reviewId));
  };

  const removeAdminReply = async (reviewId: string) => {
    await updateDoc(doc(db, 'reviews', reviewId), { adminReply: null });
  };

  return (
    <ReviewContext.Provider value={{ reviews, addReview, replyToReview, removeReview, removeAdminReply }}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewContext);
  if (!context) throw new Error("useReviews must be used within a ReviewProvider");
  return context;
} 