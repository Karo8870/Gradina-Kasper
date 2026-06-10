'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Props = {
  boxID: number;
};

export function NotifyWhenAvailableButton({ boxID }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    const loadNotificationStatus = async () => {
      const response = await fetch(`/api/box-notifications?boxID=${boxID}`);
      const data = await response.json();

      setNotified(Boolean(data?.exists));
    };

    loadNotificationStatus().catch(() => undefined);
  }, [boxID]);

  const notify = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/box-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ boxID })
      });

      if (response.status === 401) {
        const redirect = `${window.location.pathname}${window.location.search}`;
        router.push(
          `/login?warning=${encodeURIComponent('Trebuie să fii autentificat pentru a primi notificări despre disponibilitatea boxurilor.')}&redirect=${encodeURIComponent(redirect)}`
        );
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Nu am putut crea notificarea.');
      }

      toast.success(data?.message || 'Notificarea a fost salvată.');
      setNotified(true);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className='bg-primary-600 hover:bg-primary-700 h-14 w-full rounded-[20px] text-base font-semibold text-white'
      disabled={loading || notified}
      onClick={notify}
      type='button'
    >
      {notified
        ? 'Veți fi notificat când acest box devine disponibil'
        : loading
          ? 'Se salvează...'
          : 'Notifică-mă cand produsul devine disponibil'}
    </Button>
  );
}
