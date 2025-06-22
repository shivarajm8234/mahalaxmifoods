import React, { useState } from "react";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ReviewFormProps {
  onSubmit: (review: { name: string; rating: number; comment: string }) => void;
  onCancel: () => void;
}

export function ReviewForm({ onSubmit, onCancel }: ReviewFormProps) {
  const [form, setForm] = useState({ name: "", rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) return;
    
      setIsSubmitting(true);
      try {
      await onSubmit(form);
      setForm({ name: "", rating: 5, comment: "" });
      } catch (error) {
        console.error("Error submitting review:", error);
      } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#F9F7F1] p-6 rounded-xl shadow-lg border-2 border-[#FF6B35]/20">
      <h3 className="text-2xl font-playfair font-bold mb-4 text-[#2F2F2F]">Write a Review</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#2F2F2F] mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="name"
          required
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-[#6FBF73] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] bg-white text-[#2F2F2F]"
        />
      </div>

        <div>
          <label className="block text-sm font-medium text-[#2F2F2F] mb-1">
            Rating
          </label>
          <StarRating
            rating={form.rating}
            onChange={(rating) => setForm(f => ({ ...f, rating }))}
          />
      </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-[#2F2F2F] mb-1">
            Your Review
          </label>
          <textarea
          id="comment"
            required
            value={form.comment}
            onChange={(e) => setForm(f => ({ ...f, comment: e.target.value }))}
          rows={4}
            className="w-full px-4 py-2 rounded-lg border border-[#6FBF73] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] bg-white text-[#2F2F2F] resize-none"
            placeholder="Share your experience with our products..."
        />
      </div>

      <div className="flex gap-2">
          <button
          type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-[#D7263D] text-[#F9F7F1] py-2 rounded-full font-bold hover:bg-[#FF6B35] transition-colors duration-200 disabled:opacity-50"
        >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
          <button
          type="button" 
          onClick={onCancel}
          disabled={isSubmitting}
            className="px-6 py-2 rounded-full border-2 border-[#FF6B35] text-[#2F2F2F] hover:bg-[#FF6B35]/10 transition-colors duration-200 disabled:opacity-50"
        >
          Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
