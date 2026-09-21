'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { cancelOrder } from '@/actions/orders';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { withFeedback } from '@/lib/auth/utils';

export function CancelOrderButton({ orderID }: { orderID: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  function confirmCancellation() {
    setMessage('');
    startTransition(async () => {
      const result = await cancelOrder({ orderID });
      if (!result.success) {
        setMessage(result.message);
        return;
      }

      router.replace(
        withFeedback(
          `/account/orders/${orderID}`,
          'success',
          'Comanda a fost anulată. Cineva din echipă va rambursa banii în cel mai scurt timp.'
        )
      );
    });
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button variant='destructive' />}>
        Anulează comanda
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anulezi comanda #{orderID}?</DialogTitle>
          <DialogDescription>
            Solicitarea va marca imediat comanda drept anulată. Plata nu este
            rambursată automat; echipa magazinului va procesa anularea.
          </DialogDescription>
        </DialogHeader>
        {message ? (
          <p className='text-destructive text-sm' role='alert'>
            {message}
          </p>
        ) : null}
        <div className='flex justify-end gap-2'>
          <DialogClose
            render={<Button disabled={isPending} variant='outline' />}
          >
            Renunță
          </DialogClose>
          <Button
            disabled={isPending}
            onClick={confirmCancellation}
            variant='destructive'
          >
            {isPending ? 'Se anulează…' : 'Confirmă anularea'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
