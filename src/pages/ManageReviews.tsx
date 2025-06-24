import React, { useState, useCallback, useMemo } from "react";
import { useReviews } from "@/contexts/ReviewContext";
import { useProducts } from "@/contexts/ProductContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';
type FilterOption = 'all' | 'replied' | 'unreplied';

const ITEMS_PER_PAGE = 5;

export default function ManageReviews() {
  const { reviews, replyToReview, removeReview } = useReviews();
  const { products } = useProducts();
  const [replyInputs, setReplyInputs] = useState<{ [id: string]: string }>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleReplyChange = (id: string, value: string) => {
    setReplyInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleReplySubmit = async (id: string) => {
    const replyText = replyInputs[id]?.trim();
    if (!replyText) return;

    setSubmitting(id);
    try {
      await replyToReview(id, replyText);
      setReplyInputs(prev => ({ ...prev, [id]: '' }));
      toast.success('Reply submitted successfully');
    } catch (error) {
      console.error('Failed to submit reply:', error);
      toast.error('Failed to submit reply. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  const getProductTitle = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.title : 'Unknown Product';
  }, [products]);

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    // Apply filter
    if (filterBy === 'replied') {
      result = result.filter(review => !!review.adminReply);
    } else if (filterBy === 'unreplied') {
      result = result.filter(review => !review.adminReply);
    }

    // Apply sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      switch (sortBy) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return dateB - dateA;
      }
    });

    return result;
  }, [reviews, sortBy, filterBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = filteredAndSortedReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDeleteReview = async (id: string) => {
    setDeletingId(id);
    try {
      await removeReview(id);
      toast.success('Review deleted successfully');
      // Reset to first page if current page becomes empty
      if (paginatedReviews.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error('Failed to delete review. Please try again.');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No reviews yet</h3>
          <p className="mt-1 text-gray-500">Customer reviews will appear here once they're submitted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-[#2F2F2F]">Customer Reviews</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</span>
            <Select value={sortBy} onValueChange={(value) => {
              setSortBy(value as SortOption);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter:</span>
            <Select value={filterBy} onValueChange={(value) => {
              setFilterBy(value as FilterOption);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="unreplied">Unreplied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {paginatedReviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
              <div>
                <span className="font-bold text-lg text-[#2F2F2F]">{review.userName}</span>
                <span className="ml-2 text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                <span className="ml-4 text-sm text-gray-500">{new Date(review.createdAt).toLocaleString()}</span>
              </div>
              <span className="text-xs bg-[#FF6B35]/10 text-[#FF6B35] px-2 py-1 rounded-full">Product: {getProductTitle(review.productId)}</span>
              <div className="relative">
                <button
                  className="ml-4 bg-[#D7263D] hover:bg-[#FF6B35] text-white px-3 py-1 rounded font-bold transition-colors text-xs flex items-center gap-1"
                  onClick={() => setShowDeleteConfirm(showDeleteConfirm === review.id ? null : review.id)}
                  disabled={deletingId === review.id}
                  title="Remove review"
                >
                  {deletingId === review.id ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    'Remove'
                  )}
                </button>
                
                {showDeleteConfirm === review.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-red-100">
                    <div className="p-3">
                      <p className="text-sm text-gray-700 mb-2">Delete this review?</p>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(null);
                          }}
                          className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          disabled={deletingId === review.id}
                        >
                          {deletingId === review.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mb-4 text-[#2F2F2F]">{review.comment}</div>
            {review.adminReply ? (
              <div className="mt-3 pl-4 border-l-2 border-[#FF6B35]">
                <span className="font-semibold text-[#FF6B35]">Your Reply:</span>
                <div className="text-sm text-[#2F2F2F] mt-1">{review.adminReply}</div>
              </div>
            ) : (
              <div className="mt-3">
                <textarea
                  className="w-full border rounded-lg p-2 mb-2"
                  rows={2}
                  placeholder="Write your reply..."
                  value={replyInputs[review.id] || ""}
                  onChange={e => handleReplyChange(review.id, e.target.value)}
                  disabled={!!submitting}
                />
                <Button
                  onClick={() => handleReplySubmit(review.id)}
                  disabled={!replyInputs[review.id]?.trim() || submitting === review.id}
                  className="bg-[#FF6B35] hover:bg-[#D7263D]"
                >
                  {submitting === review.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Replying...
                    </>
                  ) : (
                    'Reply'
                  )}
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedReviews.length)}
            </span>{' '}
            of <span className="font-medium">{filteredAndSortedReviews.length}</span> reviews
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 