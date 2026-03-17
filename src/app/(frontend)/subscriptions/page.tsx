'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Repeat2, Trash2 } from 'lucide-react';
import { useState } from 'react';

type Interval = 'săptămânal' | 'la două săptămâni';
type BoxType = 'Cutia Kasper' | 'Cutia Kasper Family' | 'Cutia Kasper XL';

type SubscriptionLine = {
  id: string;
  boxType: BoxType;
  quantity: number;
  interval: Interval;
};

const boxTypes: BoxType[] = ['Cutia Kasper', 'Cutia Kasper Family', 'Cutia Kasper XL'];
const intervals: Interval[] = ['săptămânal', 'la două săptămâni'];

function createLine(): SubscriptionLine {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    boxType: 'Cutia Kasper',
    quantity: 1,
    interval: 'săptămânal'
  };
}

export default function SubscriptionsPage() {
  const [lines, setLines] = useState<SubscriptionLine[]>([
    {
      id: 'subscription-1',
      boxType: 'Cutia Kasper',
      quantity: 1,
      interval: 'săptămânal'
    },
    {
      id: 'subscription-2',
      boxType: 'Cutia Kasper Family',
      quantity: 2,
      interval: 'la două săptămâni'
    }
  ]);

  const [saved, setSaved] = useState(false);

  const updateLine = (id: string, patch: Partial<SubscriptionLine>) => {
    setSaved(false);
    setLines((current) =>
      current.map((line) => (line.id === id ? { ...line, ...patch } : line))
    );
  };

  const addLine = () => {
    setSaved(false);
    setLines((current) => [...current, createLine()]);
  };

  const removeLine = (id: string) => {
    setSaved(false);
    setLines((current) => current.filter((line) => line.id !== id));
  };

  return (
    <section className='flex w-full justify-center px-2 sm:px-4'>
      <main className='border-border mt-12 flex w-full max-w-[60rem] flex-col items-stretch gap-8 rounded-3xl border bg-white px-4 py-8 max-sm:gap-6 sm:px-6'>
        <div className='flex flex-col items-center gap-4'>
          <div className='bg-secondary-100 flex aspect-square items-center justify-center rounded-full p-6'>
            <Repeat2 className='text-primary-900 h-10 w-10' />
          </div>
          <h1 className='text-primary-900 text-4xl font-bold max-sm:text-2xl'>
            Abonamente
          </h1>
          <p className='text-muted-foreground text-center text-sm'>
            Gestionează box-urile recurente, cantitatea și intervalul de livrare.
          </p>
        </div>

        <div className='flex flex-col gap-4'>
          {lines.map((line) => (
            <article
              key={line.id}
              className='border-border grid gap-3 rounded-2xl border p-4 md:grid-cols-[1.4fr_120px_1fr_auto] md:items-end'
            >
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium text-primary-900'>
                  Tip box
                </label>
                <select
                  value={line.boxType}
                  onChange={(event) =>
                    updateLine(line.id, { boxType: event.target.value as BoxType })
                  }
                  className='border-input bg-background text-foreground h-11 rounded-2xl border px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
                >
                  {boxTypes.map((boxType) => (
                    <option key={boxType} value={boxType}>
                      {boxType}
                    </option>
                  ))}
                </select>
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium text-primary-900'>
                  Cantitate
                </label>
                <Input
                  type='number'
                  min={1}
                  value={line.quantity}
                  onChange={(event) => {
                    const parsed = Number.parseInt(event.target.value, 10);
                    updateLine(line.id, {
                      quantity: Number.isNaN(parsed) || parsed < 1 ? 1 : parsed
                    });
                  }}
                />
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium text-primary-900'>
                  Interval
                </label>
                <select
                  value={line.interval}
                  onChange={(event) =>
                    updateLine(line.id, {
                      interval: event.target.value as Interval
                    })
                  }
                  className='border-input bg-background text-foreground h-11 rounded-2xl border px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
                >
                  {intervals.map((interval) => (
                    <option key={interval} value={interval}>
                      {interval}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type='button'
                variant='outline'
                className='h-11 w-full md:w-11 md:px-0'
                aria-label='Șterge abonamentul'
                onClick={() => removeLine(line.id)}
                disabled={lines.length === 1}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </article>
          ))}
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <Button
            type='button'
            variant='outline'
            className='h-11 rounded-2xl'
            onClick={addLine}
          >
            <Plus className='h-4 w-4' />
            Adaugă linie abonament
          </Button>

          <Button
            type='button'
            className='h-11 rounded-2xl bg-primary-900 text-white hover:bg-primary-800'
            onClick={() => setSaved(true)}
          >
            Salvează abonamentele
          </Button>

          {saved ? (
            <p className='text-sm font-medium text-primary-800'>
              Modificările au fost actualizate.
            </p>
          ) : null}
        </div>
      </main>
    </section>
  );
}