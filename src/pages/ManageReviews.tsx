import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Check, X, Search, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useReviews } from "@/contexts/ReviewContext";
import { useProducts } from "@/contexts/ProductContext";
import { useState } from "react";

export default function ManageReviews() {
  const { reviews, replyToReview, removeReview } = useReviews();
  const { products } = useProducts();
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const getProductName = (productId: string) => {
    const found = products.find(p => p.id === productId);
    return found ? found.title : productId;
  };

  const handleReply = (reviewId: string) => {
    if (replyText.trim()) {
      replyToReview(reviewId, replyText.trim());
      setReplyingId(null);
      setReplyText("");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Reviews</h1>
          <p className="text-muted-foreground">
            Moderate and respond to customer reviews
          </p>
        </div>
        <div className="relative mt-4 md:mt-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reviews..."
            className="w-full pl-8 md:w-[200px] lg:w-[300px]"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>
                View and manage customer reviews
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">
                    {getProductName(review.productId)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {review.userName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      {review.rating}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {review.comment}
                    {review.adminReply && (
                      <div className="mt-2 text-xs text-green-700 bg-green-50 rounded p-2">Admin Reply: {review.adminReply}</div>
                    )}
                    {replyingId === review.id && (
                      <div className="mt-2 flex gap-2">
                        <Input
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Type your reply..."
                          className="text-xs"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleReply(review.id)}>
                          Send
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setReplyingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Visible</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setReplyingId(review.id)} title="Reply">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-red-600" onClick={() => removeReview(review.id)} title="Delete">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
