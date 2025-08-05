'use client';

import { Button } from '@heroui/button';
import { refreshProducts } from '@/lib/api/products';

export default function ReloadButton() {
  return (
    <Button
      onClick={async () => {
        await refreshProducts();
      }}
    >
      Reîncarcă produse din SoftOne
    </Button>
  );
}
