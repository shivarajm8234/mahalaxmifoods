import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { Plus, Edit, Trash2, Upload, FileText, Archive, ArchiveRestore, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { storage } from "@/firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface ProductManagementProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'status' | 'createdAt'>) => Promise<boolean>;
  onUpdateProduct: (id: string, product: Omit<Product, 'id'| 'status'>) => Promise<void>;
  onArchiveProduct: (id: string) => void;
  onRestoreProduct: (id: string) => void;
  onDeletePermanently: (id: string) => void;
}

export function ProductManagement({ 
  products, 
  onAddProduct, 
  onUpdateProduct, 
  onArchiveProduct,
  onRestoreProduct,
  onDeletePermanently,
}: ProductManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    image: "",
    badge: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      image: "",
      badge: ""
    });
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file: PNG, JPG, or JPEG');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(false);
    setUploadProgress(null);
    let imageUrl = formData.image;
    // If a new file is selected, upload to Firebase Storage
    if (selectedFile) {
      try {
        setUploading(true);
        const storageRef = ref(storage, `product-images/${Date.now()}_${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              setUploading(false);
              setUploadProgress(null);
              alert('Image upload failed: ' + error.message);
              reject(error);
            },
            async () => {
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              setUploading(false);
              setUploadProgress(null);
              resolve();
            }
          );
        });
      } catch (error: any) {
        alert('Image upload failed: ' + error.message);
        setUploading(false);
        setUploadProgress(null);
        return;
      }
    }
    const productData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      image: imageUrl,
      badge: formData.badge || undefined
    };
    if (editingProduct) {
      await onUpdateProduct(editingProduct.id, productData);
      setEditingProduct(null);
      resetForm();
      setIsAddDialogOpen(false);
    } else {
      const success = await onAddProduct(productData);
      if (success) {
        resetForm();
        setIsAddDialogOpen(false);
      }
    }
  };

  const handleEdit = (product: Product) => {
    console.log('handleEdit called', product);
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      badge: product.badge || ""
    });
    setSelectedFile(null);
    setPreviewUrl(product.image);
  };

  const handleArchive = (id: string) => {
    if (confirm("Are you sure you want to archive this product?")) {
      onArchiveProduct(id);
    }
  };

  const handlePermanentDelete = (id: string) => {
    if (confirm("This action is permanent and cannot be undone. Are you sure you want to permanently delete this product?")) {
      onDeletePermanently(id);
    }
  };

  const activeProducts = products.filter(p => p.status === 'active');
  const archivedProducts = products.filter(p => p.status === 'archived');

  const renderFilePreview = () => {
    if (!selectedFile && !previewUrl) return null;

    if (selectedFile && selectedFile.type.startsWith('image/')) {
      return (
        <div className="mt-2">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-32 object-cover rounded-md border"
          />
        </div>
      );
    } else if (selectedFile && selectedFile.type === 'application/pdf') {
      return (
        <div className="mt-2 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-red-500" />
            <span className="text-sm font-medium">{selectedFile.name}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">PDF file selected</p>
        </div>
      );
    } else if (previewUrl && !selectedFile) {
      // Show image preview if editing and no new file is selected
      return (
        <div className="mt-2">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-32 object-cover rounded-md border"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the details for the new product.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Product Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="image">Product Image/File</Label>
                <div className="mt-1">
                  <Input
                    id="image"
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="image"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Upload className="h-4 w-4" />
                    Choose File (PNG, JPG, JPEG)
                  </Label>
                  {selectedFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
                {renderFilePreview()}
              </div>
              <div>
                <Label htmlFor="badge">Badge (Optional)</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g., NEW, Popular, Bestseller"
                />
              </div>
              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress ?? 0}%` }}
                  ></div>
                  <span className="text-xs ml-2">Uploading image... {uploadProgress?.toFixed(0)}%</span>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => {
        if (!open) setEditingProduct(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Product Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Price (₹)</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-image">Product Image/File</Label>
              <div className="mt-1">
                <Input
                  id="edit-image"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label
                  htmlFor="edit-image"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Upload className="h-4 w-4" />
                  Choose File (PNG, JPG, JPEG)
                </Label>
                {selectedFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              {renderFilePreview()}
            </div>
            <div>
              <Label htmlFor="edit-badge">Badge (Optional)</Label>
              <Input
                id="edit-badge"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g., NEW, Popular, Bestseller"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeProducts.map((product) => (
          <Card key={product.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{product.title}</CardTitle>
                  {product.badge && (
                    <Badge variant="secondary" className="mt-1">
                      {product.badge}
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      console.log('Edit clicked', product);
                      handleEdit(product);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onArchiveProduct(product.id)}
                    aria-label="Archive Product"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="w-full h-32 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {product.image.startsWith('data:application/pdf') ? (
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">PDF Document</p>
                    </div>
                  ) : (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/placeholder.svg";
                      }}
                    />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {product.description}
                </p>
                <p className="font-semibold text-lg">₹{product.price.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeProducts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No products found. Add your first product to get started.</p>
        </div>
      )}

      {/* Archived Products Section */}
      <Collapsible className="mt-12 pt-8 border-t">
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full text-left">
            <h3 className="text-xl font-bold">
              Archived Products ({archivedProducts.length})
            </h3>
            <ChevronsUpDown className="h-5 w-5 text-gray-500" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-6">
          {archivedProducts.length > 0 ? (
            <div className="space-y-4">
              {archivedProducts.map((product) => (
                <Card key={product.id} className="bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between p-4">
                  <div>
                    <h4 className="font-semibold">{product.title}</h4>
                    <p className="text-sm text-gray-500">₹{product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => onRestoreProduct(product.id)}
                    >
                      <ArchiveRestore className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePermanentDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Permanently
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No archived products.</p>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
} 