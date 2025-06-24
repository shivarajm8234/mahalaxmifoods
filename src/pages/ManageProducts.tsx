import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
};

export default function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const { toast } = useToast();

  // Load products from API or local state
  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchProducts = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setProducts([
          // Sample products
          {
            id: '1',
            title: 'Sample Product',
            description: 'This is a sample product',
            price: 9.99,
            image: '/placeholder.svg',
            category: 'spices'
          }
        ]);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  const handleSave = async () => {
    try {
      // TODO: Implement save/update logic
      if (currentProduct.id) {
        // Update existing product
        setProducts(products.map(p => 
          p.id === currentProduct.id ? { ...p, ...currentProduct } as Product : p
        ));
        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });
      } else {
        // Add new product
        const newProduct = {
          ...currentProduct,
          id: Date.now().toString(),
        } as Product;
        setProducts([...products, newProduct]);
        toast({
          title: 'Success',
          description: 'Product added successfully',
        });
      }
      setIsEditing(false);
      setCurrentProduct({});
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete confirmation and API call
    setProducts(products.filter(p => p.id !== id));
    toast({
      title: 'Success',
      description: 'Product deleted successfully',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <Button onClick={() => {
          setCurrentProduct({});
          setIsEditing(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {isEditing ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{currentProduct.id ? 'Edit' : 'Add New'} Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={currentProduct.title || ''}
                  onChange={(e) => setCurrentProduct({...currentProduct, title: e.target.value})}
                  placeholder="Product title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={currentProduct.description || ''}
                  onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}
                  placeholder="Product description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={currentProduct.price || ''}
                    onChange={(e) => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)})}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={currentProduct.category || ''}
                    onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})}
                    placeholder="Category"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={currentProduct.image || ''}
                  onChange={(e) => setCurrentProduct({...currentProduct, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {currentProduct.id ? 'Update' : 'Add'} Product
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-16 w-16 rounded-md object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                <div>
                  <h3 className="font-medium">{product.title}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                  <p className="text-sm font-medium">${product.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentProduct(product);
                    setIsEditing(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
