import { getActiveProducts } from '@/lib/supabase/queries/products';
import { ProductCard } from '@/components/product-card';

export default async function Home() {
  const products = await getActiveProducts();

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">전체 상품</h1>
      
      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          등록된 상품이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
