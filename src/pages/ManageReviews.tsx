import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Check, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Review = {
  id: string;
  productName: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
};

const reviews: Review[] = [
  {
    id: '1',
    productName: 'Spice Mix',
    rating: 5,
    comment: 'Amazing flavor! Will definitely buy again.',
    author: 'John D.',
    date: '2023-06-15',
    status: 'approved',
  },
  {
    id: '2',
    productName: 'Turmeric Powder',
    rating: 4,
    comment: 'Good quality, but packaging could be better.',
    author: 'Sarah M.',
    date: '2023-06-10',
    status: 'pending',
  },
  {
    id: '3',
    productName: 'Garam Masala',
    rating: 3,
    comment: 'Average taste, expected more flavor.',
    author: 'Mike R.',
    date: '2023-06-05',
    status: 'pending',
  },
];

export default function ManageReviews() {
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
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm">
                All
              </Button>
              <Button variant="ghost" size="sm">
                Pending
              </Button>
              <Button variant="ghost" size="sm">
                Approved
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
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
                    {review.productName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      {review.rating}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {review.comment}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        review.status === 'approved'
                          ? 'default'
                          : review.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {review.status === 'pending' && (
                        <>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm">
                        View
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
