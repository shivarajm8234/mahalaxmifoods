import { ProductManagement } from "@/components/ProductManagement";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserCircle } from "lucide-react";
import { useProducts } from "@/contexts/ProductContext";

const AdminProducts = () => {
  const navigate = useNavigate();
  const { 
    products, 
    addProduct, 
    updateProduct, 
    archiveProduct, 
    restoreProduct, 
    deleteProductPermanently 
  } = useProducts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-sans">
      <div className="max-w-7xl mx-auto py-10">
        <div className="flex justify-between items-center mb-10 px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/dashboard")}
              className="shadow-md"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-extrabold text-black dark:text-white">Product Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/")} variant="secondary" className="shadow-md">
              View Website
            </Button>
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800 px-3 py-1 rounded-full shadow">
              <UserCircle className="h-7 w-7 text-indigo-500 dark:text-indigo-300" />
              <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Admin</span>
            </div>
          </div>
        </div>
        <div className="bg-white/90 dark:bg-gray-900/80 rounded-3xl shadow-2xl p-8 md:p-12 transition-all duration-300">
          <ProductManagement
            products={products}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onArchiveProduct={archiveProduct}
            onRestoreProduct={restoreProduct}
            onDeletePermanently={deleteProductPermanently}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminProducts; 