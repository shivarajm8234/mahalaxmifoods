import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProducts } from "@/contexts/ProductContext";
import { Plus, Edit, Trash2, ArchiveRestore, Archive } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function ManageProducts() {
  const { products, addProduct, deleteProductPermanently, updateProduct, archiveProduct, restoreProduct } = useProducts();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", price: "", image: "", badge: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleOpen = () => {
    setForm({ title: "", description: "", price: "", image: "", badge: "" });
    setError("");
    setEditMode(false);
    setEditId(null);
    setOpen(true);
  };

  const handleEdit = (product: any) => {
    setForm({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      badge: product.badge || ""
    });
    setEditMode(true);
    setEditId(product.id);
    setError("");
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "file" && name === "image") {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setImageFile(file);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price) {
      setError("All fields except badge and image are required.");
      return;
    }
    let imageData = form.image;
    if (imageFile) {
      if (!/\.(jpg|jpeg|png)$/i.test(imageFile.name)) {
        setError("Image must be a .jpg or .png file.");
        return;
      }
      imageData = await toBase64(imageFile);
    }
    try {
      if (editMode && editId) {
        await updateProduct(editId, {
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          image: imageData,
          badge: form.badge || undefined,
        });
        setOpen(false);
        setImageFile(null);
      } else {
        const success = await addProduct({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          image: imageData,
          badge: form.badge || undefined,
        });
        if (success) {
          setOpen(false);
          setImageFile(null);
        }
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add product. Check your connection or permissions.',
        variant: 'destructive',
      });
    }
  };

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductPermanently(id);
    }
  };

  const handleArchive = (id: string) => {
    if (window.confirm("Archive this product? It will show as out of stock.")) {
      archiveProduct(id);
    }
  };

  const handleRestore = (id: string) => {
    if (window.confirm("Restore this product to active status?")) {
      restoreProduct(id);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Products</h1>
          <p className="text-muted-foreground">
            Add, edit, or remove products from your store
          </p>
        </div>
        <Button onClick={handleOpen}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your product inventory and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <span>{product.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>₹{product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {product.status === 'archived' ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {product.status === 'archived' ? (
                        <Button variant="outline" size="icon" className="text-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleRestore(product.id)} title="Restore">
                          <ArchiveRestore className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="icon" className="text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700" onClick={() => handleArchive(product.id)} title="Archive">
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit Product' : 'Add Product'}</DialogTitle>
            </DialogHeader>
            <div>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Title"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                type="number"
                min="0"
                step="0.01"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <input
                name="image"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required={!editMode}
              />
              {editMode && !imageFile && form.image && (
                <div className="mt-2">
                  <img src={form.image} alt="Current" className="h-16 w-16 object-cover rounded" />
                  <span className="text-xs text-gray-500 ml-2">Current image</span>
                </div>
              )}
            </div>
            <div>
              <input
                name="badge"
                value={form.badge}
                onChange={handleChange}
                placeholder="Badge (optional)"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <DialogFooter>
              <Button type="submit">{editMode ? 'Save Changes' : 'Add Product'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
