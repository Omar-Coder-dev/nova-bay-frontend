"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Review, ReviewsResponse } from "@/types";
import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  MessageSquare,
  Trash2,
  Pencil,
} from "lucide-react";

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { user } = useAuthStore();
  const formRef = useRef<HTMLFormElement>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  
  // Track if current authenticated user has already written a review anywhere in the product
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  // Tracks active voting request
  const [votingId, setVotingId] = useState<string | null>(null);

  const fetchReviews = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const response = await api.get<ReviewsResponse>(
          `/reviews/product/${productId}`,
          { params: { page, limit: 5 } }
        );
        
        setReviews(response.data.reviews);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
        setTotalReviews(response.data.totalReviews);

        // Check if user has a review in the current payload
        if (user && response.data.reviews.some((r) => r.user._id === user._id)) {
          setHasUserReviewed(true);
        }
      } catch {
        toast.error("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    },
    [productId, user]
  );

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const resetForm = () => {
    setRating(0);
    setComment("");
    setEditingReviewId(null);
  };

  const handleStartEdit = (review: Review) => {
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment.");
      return;
    }

    setSubmitting(true);

    try {
      if (editingReviewId) {
        await api.patch(`/reviews/${editingReviewId}`, { rating, comment });
        toast.success("Review updated.");
      } else {
        await api.post("/reviews", { productId, rating, comment });
        toast.success("Review posted.");
        setHasUserReviewed(true);
      }
      resetForm();
      fetchReviews(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success("Review deleted.");
      
      if (editingReviewId === reviewId) {
        resetForm();
      }

      setHasUserReviewed(false);

      // Handle page boundary when deleting the last item on a page
      const isLastItemOnPage = reviews.length === 1 && currentPage > 1;
      const targetPage = isLastItemOnPage ? currentPage - 1 : currentPage;
      
      fetchReviews(targetPage);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete review.");
    }
  };

  const handleVote = async (reviewId: string, type: "upvote" | "downvote") => {
    if (!user) {
      toast.error("Please sign in to vote on reviews.");
      return;
    }

    setVotingId(reviewId);

    // Optimistic UI update
    setReviews((prev) =>
      prev.map((r) => {
        if (r._id !== reviewId) return r;
        
        const hasUpvoted = r.upvotes.includes(user._id);
        const hasDownvoted = r.downvotes.includes(user._id);

        let newUpvotes = [...r.upvotes];
        let newDownvotes = [...r.downvotes];

        if (type === "upvote") {
          newUpvotes = hasUpvoted
            ? newUpvotes.filter((id) => id !== user._id)
            : [...newUpvotes, user._id];
          newDownvotes = newDownvotes.filter((id) => id !== user._id);
        } else {
          newDownvotes = hasDownvoted
            ? newDownvotes.filter((id) => id !== user._id)
            : [...newDownvotes, user._id];
          newUpvotes = newUpvotes.filter((id) => id !== user._id);
        }

        return { ...r, upvotes: newUpvotes, downvotes: newDownvotes };
      })
    );

    try {
      const response = await api.patch<Review>(`/reviews/${reviewId}/${type}`);
      // Sync with exact server response state
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? response.data : r))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to vote.");
      // Rollback by refetching page state on failure
      fetchReviews(currentPage);
    } finally {
      setVotingId(null);
    }
  };

  return (
    <div className="mt-16 border-t border-border pt-10">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-foreground">
        <MessageSquare className="h-6 w-6 text-blue-500" />
        Reviews {totalReviews > 0 && `(${totalReviews})`}
      </h2>

      {/* Write / Edit form */}
      {user && (!hasUserReviewed || editingReviewId) && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mb-8 space-y-4 rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="font-semibold text-foreground">
            {editingReviewId ? "Edit your review" : "Write a review"}
          </h3>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your thoughts about this product..."
            className="w-full resize-none rounded-lg border border-border bg-muted p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingReviewId ? "Update Review" : "Post Review"}
            </Button>
            {editingReviewId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      {!user && (
        <div className="mb-8 rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
          Sign in to leave a review.
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No reviews yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isOwner = review.user._id === user?._id;
            const isVoting = votingId === review._id;
            const hasUpvoted = user ? review.upvotes.includes(user._id) : false;
            const hasDownvoted = user ? review.downvotes.includes(user._id) : false;

            return (
              <div
                key={review._id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {review.user.name}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {(isOwner || user?.role === "admin") && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartEdit(review)}
                        className="text-muted-foreground hover:text-blue-500"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="mt-2 text-sm text-foreground">{review.comment}</p>

                <div className="mt-3 flex items-center gap-4">
                  <button
                    onClick={() => handleVote(review._id, "upvote")}
                    disabled={isVoting}
                    className={`flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-40 ${
                      hasUpvoted
                        ? "text-blue-500"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {review.upvotes.length}
                  </button>
                  <button
                    onClick={() => handleVote(review._id, "downvote")}
                    disabled={isVoting}
                    className={`flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-40 ${
                      hasDownvoted
                        ? "text-red-500"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    {review.downvotes.length}
                  </button>
                </div>
              </div>
            );
          })}

          {totalPages > 1 && (
            <div className="flex justify-center gap-3 pt-4">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => fetchReviews(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => fetchReviews(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}