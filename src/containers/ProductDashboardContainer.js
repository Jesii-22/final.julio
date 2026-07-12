import CategoryManager from "@/components/CategoryManager";
import ProductManager from "@/components/ProductManager";
import { getCategories } from "@/lib/categories";
import { getProducts } from "@/lib/products";

export default async function ProductDashboardContainer() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return (
    <div className="space-y-10">
      <CategoryManager initialCategories={categories} />
      <ProductManager
        initialCategories={categories}
        initialProducts={products}
      />
    </div>
  );
}
