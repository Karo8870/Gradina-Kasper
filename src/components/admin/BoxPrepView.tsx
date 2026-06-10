'use client';

import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type BoxPrepItem = {
  productId: number;
  productTitle: string;
  totalQuantity: number;
};

export const BoxPrepView: React.FC = () => {
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [items, setItems] = useState<BoxPrepItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (start) params.set('start', start);
      if (end) params.set('end', end);
      if (status) params.set('status', status);
      params.set('detail', 'full');

      const url = `/api/admin/orders?${params.toString()}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error('Failed to load orders');
      const json = await res.json();

      // Aggregate quantities by product
      const aggregated: Record<number, { title: string; qty: number }> = {};

      (json.docs || []).forEach((order: any) => {
        (order.items || []).forEach((item: any) => {
          if (item.product && typeof item.product === 'object') {
            const pid = item.product.id;
            if (!aggregated[pid]) {
              aggregated[pid] = { title: item.product.title, qty: 0 };
            }
            aggregated[pid].qty += item.quantity || 0;
          }
        });
      });

      const boxList: BoxPrepItem[] = Object.entries(aggregated)
        .map(([id, data]) => ({
          productId: Number(id),
          productTitle: data.title,
          totalQuantity: data.qty
        }))
        .sort((a, b) => b.totalQuantity - a.totalQuantity);

      setItems(boxList);
    } catch (err) {
      toast.error((err as Error).message || 'Eroare');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap gap-2'>
        <label className='flex items-center gap-2'>
          <span className='text-sm'>Start</span>
          <input
            type='date'
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className='rounded border px-2 py-1'
          />
        </label>
        <label className='flex items-center gap-2'>
          <span className='text-sm'>End</span>
          <input
            type='date'
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className='rounded border px-2 py-1'
          />
        </label>
        <label className='flex items-center gap-2'>
          <span className='text-sm'>Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className='rounded border px-2 py-1'
          >
            <option value=''>All</option>
            <option value='processing'>processing</option>
            <option value='completed'>completed</option>
            <option value='cancelled'>cancelled</option>
            <option value='refunded'>refunded</option>
          </select>
        </label>
        <Button onClick={() => fetchData()} disabled={loading}>
          Filter
        </Button>
      </div>

      {items.length === 0 ? (
        <div className='rounded border border-neutral-200 bg-neutral-50 p-6 text-center text-neutral-600'>
          No orders found for the selected period.
        </div>
      ) : (
        <div className='overflow-auto rounded border'>
          <table className='min-w-full table-auto'>
            <thead>
              <tr className='bg-neutral-100 text-left'>
                <th className='p-3 font-semibold'>Product</th>
                <th className='p-3 text-right font-semibold'>
                  Quantity to Prepare
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.productId}
                  className='border-t hover:bg-neutral-50'
                >
                  <td className='p-3'>{item.productTitle}</td>
                  <td className='p-3 text-right'>
                    <span className='inline-flex min-w-16 items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-lg font-bold text-blue-900'>
                      {item.totalQuantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className='text-sm text-neutral-600'>
        <strong>Total boxes:</strong>{' '}
        {items.reduce((sum, item) => sum + item.totalQuantity, 0)}
      </div>
    </div>
  );
};

export default BoxPrepView;
