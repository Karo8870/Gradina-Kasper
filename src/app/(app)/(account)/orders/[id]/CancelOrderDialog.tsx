'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

type Props = {
  accessToken?: string;
  action: (formData: FormData) => Promise<void>;
  email?: string;
  orderID: string;
};

export const CancelOrderDialog: React.FC<Props> = ({
  accessToken = '',
  action,
  email = '',
  orderID
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className='h-10 rounded-full border border-neutral-300 bg-white px-5 text-primary-900 shadow-none hover:bg-neutral-100'
          type='button'
          variant='outline'
        >
          Anulează comanda
        </Button>
      </DialogTrigger>

      <DialogContent className='rounded-2xl border-neutral-200 bg-white'>
        <DialogHeader>
          <DialogTitle>Anulezi comanda?</DialogTitle>
          <DialogDescription>
            Comanda va fi marcată ca anulată, iar produsele vor fi adăugate
            înapoi în stoc.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              className='h-11 rounded-full border border-neutral-300 bg-white px-6 text-primary-900 shadow-none hover:bg-neutral-100'
              type='button'
              variant='outline'
            >
              Renunță
            </Button>
          </DialogClose>

          <form action={action}>
            <input name='orderID' type='hidden' value={orderID} />
            <input name='email' type='hidden' value={email} />
            <input name='accessToken' type='hidden' value={accessToken} />
            <Button
              className='h-11 rounded-full bg-primary-900 px-6 text-white shadow-none hover:bg-primary-800'
              type='submit'
            >
              Confirmă anularea
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
