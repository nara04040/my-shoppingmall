import { getActiveProducts } from '@/lib/supabase/queries/products';
import { ProductList } from '@/components/product-list';

export default async function Home() {
  const products = await getActiveProducts();

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">전체 상품</h1>
      
      <ProductList products={products} />
    </main>
  );
}
