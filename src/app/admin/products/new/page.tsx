// app/admin/products/new/page.tsx
import ProductForm from '@/components/ProductForm';

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
      <ProductForm />
    </div>
  );
}