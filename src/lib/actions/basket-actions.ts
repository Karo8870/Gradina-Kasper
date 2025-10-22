'use server';

import { getVisibleProducts } from '@/lib/api/products';

export async function calculateBasketTotalAction(basketItems: { id: number; quantity: number }[]) {
  'use server';
  
  try {
    const apiProducts = await getVisibleProducts();
    const productMap = new Map(apiProducts.map(p => [p.id, p]));
    
    let total = 0;
    const calculatedItems = [];
    
    for (const item of basketItems) {
      const product = productMap.get(item.id);
      if (product) {
        const itemTotal = product.priceWithTax * item.quantity;
        total += itemTotal;
        calculatedItems.push({
          ...product,
          quantity: item.quantity,
          total: itemTotal
        });
      }
    }
    
    return { total, items: calculatedItems };
  } catch (error) {
    console.error('Error calculating basket total:', error);
    return { total: 0, items: [] };
  }
}