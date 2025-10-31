import { supabase } from '@/lib/supabase/client';
import type { Product } from '@/types/product';

export async function getActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Supabase는 DECIMAL 타입을 문자열로 반환하므로 숫자로 변환
  return (data || []).map(product => ({
    ...product,
    price: parseFloat(product.price),
  }));
}

